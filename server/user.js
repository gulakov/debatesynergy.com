var app = require('express').Router(), model = require('./models');
var User = model.User, Doc = model.Doc, request = require('request'), config = require('../config');
module.exports = app;


//redirect to Google OAuth2 approval screen
app.all('/login', function(req, res, next) {

  var oauth_url = "https://accounts.google.com/o/oauth2/auth?response_type=code&redirect_uri=https%3A%2F%2Fdebatesynergy.com%2Fuser%2Fauth&scope=profile%20email%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive%20https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive.install&client_id=" +
     config.google.client_id + "&access_type=offline"

  if (req.query.refresh)
    oauth_url += "&prompt=consent"

  return res.redirect(oauth_url);
});

//Google OAuth2 callback to login or create new user
app.all('/auth', function(req, res, next) {

  //exchange code for access_token
  request({
    uri: 'https://www.googleapis.com/oauth2/v4/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
       code: req.query.code,
       client_id: config.google.client_id,
       client_secret: config.google.client_secret,
       redirect_uri: "https://" + req.headers.host + "/user/auth",
       grant_type: "authorization_code"
     }
  }, function (error, response, body){


    var body = JSON.parse(body);
    if (body.error){ //unauthorized
        console.log(body)
        return res.redirect('/')
    }

    //save access_token in session
    var access_token =  body.access_token;
    req.session.access_token = access_token;

    //available if explicitly requested
    var refresh_token = body.refresh_token;

    //use access_token to get user info
    request({
      url: 'https://www.googleapis.com/oauth2/v1/userinfo',
      headers: {
        'Authorization': 'Bearer ' + access_token
      }},  function (error, response, userinfo){

          console.log(userinfo);

          var userinfo = JSON.parse(userinfo);
          if (userinfo.error) //unauthorized
            return res.redirect('/')


          //remember to auto-login user through Google in future sessions
          res.cookie('autologin', 'true', { maxAge: 1000 * 3600 * 24 * 30 });


          User.findOne({email: userinfo.email}, function(err, u){

              if (u){ //returning user, save user object to session

                if (!u.auth && refresh_token)
                  User.update({_id:u._id}, {auth: refresh_token}).exec()

                req.session.user = u;

                console.log("Login: " + u.name + " " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());

                return res.redirect("/")

              } else { //new user
                User.create({
                  email: userinfo.email,
                  name: userinfo.name,
                  auth: refresh_token
                }, function (err, newAppUser ) {

                    Doc.create({
                      userid: newAppUser._id,
                      title: "First File",
                      text: "Welcome to your first file, " + newAppUser.name + "!"
                    }, function(err, firstDoc){

                      newAppUser.index=[{id: firstDoc._id, title:"First File", type:"ft-file ft-selected"}, {
                        "id": "home",
                        "title": "Home Page",
                        "type": "ft-file"}];

                      newAppUser.save(function(e){

                          console.log("NEW USER: " + newAppUser.name  + " " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());

                          return res.redirect("/")
                       });

                    });

                 });

              }

          })

      })




    });



});


//use refresh_token stored in mongodb to get access_token stored in session
app.get('/reauth', function(req, res) {

  var token = req.session.access_token;

  var refresh_token = req.session.user.auth;

  if (!refresh_token)
    res.redirect("/user/login?refresh=true")

  request({
    uri: 'https://www.googleapis.com/oauth2/v4/token',
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    form: {
       refresh_token: refresh_token,
       client_id: config.google.client_id,
       client_secret: config.google.client_secret,
       grant_type: "refresh_token"
     }
   }, function (error, response, body){

      var body = JSON.parse(body);
      if (body.error) //unauthorized
        return res.redirect('/')

      req.session.access_token = body.access_token;

      return res.redirect(req.query.next || '/')



    })


});



//end user's session and remove autologin
app.all('/logout', function(req, res) {
  req.session.destroy();

  res.cookie('autologin', 'true', { maxAge: '0' });

  return res.redirect("/")
});


//return the entire user object including file index for logged in user, or false if guest
app.all('/', function(req, res, next) {

    if (!req.session.user)
        res.send(false);
    else
        User.findOne({_id: req.session.user._id},
        function(err, u){
            res.json(u);
        })
});

app.all('/index.js', function(req, res, next) {

    if (!req.session.user)
        res.send("var u = false;");
    else
        User.findOne({_id: req.session.user._id},
          function(err, u){
            res.send("var u = "+ JSON.stringify(u))
        })
});

//repopulate current user's index with all files in database belonging to that user, losing folders
app.all('/recover', function(req, res, next) {



  Doc.find({userid: req.session.user._id}, function(e, docs) {

    var index = [];

    for(var i in docs)
      index.push({id: docs[i]._id, title: docs[i].title, type: "ft-file"});


    User.update({_id: req.session.user._id}, {index: index }).exec();

    res.json(index);

  });

});

//POST takes index or custom_js, custom_css as URIComponents, updates them for user
app.all('/update', auth, function(req, res) {


  //if user has two tabs open with different indexes or accounts, prevent race
  if (req.body.index && req.body.userid && req.body.userid != req.session.user._id)
    return res.send("User ID does not match");

  if (req.body.index)
    User.update({_id: req.session.user._id}, {index: req.body.index , date_updated: Date.now()}  ).exec();

   if (req.body.custom_js || req.body.custom_css)
    User.update({_id: req.session.user._id},  {custom_js: decodeURIComponent(req.body.custom_js),
            custom_css: decodeURIComponent(req.body.custom_css), date_updated: Date.now()}    ).exec();


  var options =  req.body.options;

   if (options && options.sidebar)
    User.update({_id: req.session.user._id},    { $set: { 'options.sidebar' : options.sidebar  }  }    ).exec();


   if (options && options.debatetype)
    User.update({_id: req.session.user._id},    { $set: { 'options.debatetype' : parseInt(options.debatetype)  }   }   ).exec();

  return res.end();
});



//takes notification type and related, clears from login notification
app.get('/notify', function(req, res) {

    var userId = req.session.user._id;
    var roundId = req.query.roundId;
    var fileId = req.query.fileId;

    if (roundId)
      User.update (
        {_id: userId},
        {$pull: {'notifications': {
          type:'round_youAreInvited',
          'roundId': roundId,
        }}}).exec();

    if (fileId)
      User.update (
        {_id: userId},
        {$pull: {'notifications': {
          type:'doc_share',
          'fileId': fileId,
        }}}).exec();

    return res.end()

});


//takes userinfo either email or name, returns list of users matching with publically friendly user objects
app.get('/search', function(req, res) {
    var userinfo = {"$regex": req.query.userinfo, "$options": "i"};

    User.find({$or:[{email:userinfo}, {name: userinfo}]}, function(error, users){
        	res.json( users ? users.map(function(user){ return {id:user._id, email: user.email, text: user.name};}) : [] );
    })
});

//URL takes /user/sample@email.com, returns data for that user
app.get('/:id?', function(req, res) {
    User.findOne( { $or:[ {email: req.params.id}, {_id: req.params.id}] }, function(error, user) {
        if(user)
        	res.json({id:user._id, email: user.email, name: user.name, socket: user.socket});
        else
        	res.send("No user found")
    })
});

//ensures user is logged in
function auth(req, res, next) {
  if (!req.session.user)
    return res.send("Login required");
  return next();
}
