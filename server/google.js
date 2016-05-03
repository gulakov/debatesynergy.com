var app = require('express').Router(), {User,Doc} = require('./models'),
request = require('request'), config = require('../config');
module.exports = app;


//call Google APIs, with setting of access_token and refreshing it if expired
app.use(function (req, res, next) {

  req.google = ({url, method="GET", qs, form, headers={}}, callback) => {

      //sign this request with access token from session db, expires 30min
      headers['Authorization'] = 'Bearer ' + req.session.access_token;
      headers['Content-Type'] = headers['Content-Type'] || 'application/x-www-form-urlencoded'

      request({
        url: (url.startsWith("http")?'':'https://www.googleapis.com/')+url,
        method, qs,  form, headers
      },(error, response, body)=>{
        try {
          var body = JSON.parse(body);
        } catch(e) {
          console.log(url, method, qs, form, headers);
          callback(body) //not JSON
          return;
        }
        if (body.error){ //access_token stored in session expired, use refresh_token stored in mongodb to get access_token

            //if no user, force auto-login
            if (!req.session.user)
              return res.redirect("/login?next="+req.url)


            User.findOne({_id: req.session.user._id}, (e, u)=>{

              var refresh_token = u.auth;


              if (!refresh_token) //if no refresh token is found, prompt for it
                res.redirect("/login?refresh=true&next="+req.url)

              request({
                uri: 'https://www.googleapis.com/oauth2/v4/token',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
                },
                form: {
                   refresh_token: refresh_token,
                   client_id: config.google.client_id,
                   client_secret: config.google.client_secret,
                   grant_type: "refresh_token"
                 }
               },  (error, response, body)=>{

                  var body = JSON.parse(body);
                  if (body.error) //if refresh token failed, prompt user to re-auth refresh token
                    res.redirect("/login?refresh=true&next="+req.url)

                  //set new access_token
                  req.session.access_token = body.access_token;

                  //redo this function with new token
                  req.google({url, method, qs, form, headers}, callback)

                })

            })

        } // end check of access expired

        //return JSON google data
        callback(body)

      })
  }

  //continue to middleware
  next();
})


//redirect to Google OAuth2 approval screen
app.all('/login', function(req, res, next){

    var {next="", refresh, youtube, contacts} = req.query, {host} = req.headers

    var params = {
      response_type: "code",
      redirect_uri: "https://" + host + "/user/auth",
      scope: "profile email https://www.googleapis.com/auth/drive https://www.googleapis.com/auth/drive.install",
      client_id: config.google.client_id,
      access_type: "offline"
    };

    if (refresh)
      params.prompt = "consent";
    if(next)
      params.state = "https://" + host + next;
    if(youtube)
      params.scope +=" https://www.googleapis.com/auth/youtube"
    if(contacts)
      params.scope +=  " https://www.google.com/m8/feeds/"

    var oauth_url = "https://accounts.google.com/o/oauth2/auth?";
    oauth_url += Object.keys(params).map(k => k + "=" + encodeURIComponent(params[k]) ).join('&');

    return res.redirect(oauth_url);
});


//Google OAuth2 callback to login or create new user
app.all('/user/auth', function(req, res, next) {
  var {client_id, client_secret} = config.google, {code} = req.query;

  //exchange code for access_token
  req.google({
    url: 'oauth2/v4/token',
    method: 'POST',
    form: {
       code, client_id, client_secret,
       redirect_uri: "https://" + req.headers.host + "/user/auth",
       grant_type: "authorization_code"
     }
  }, oauth_res=>{


    //refresh available if explicitly requested
    var {access_token, refresh_token} = oauth_res;

    //save access_token in session
    req.session.access_token = access_token;

    //use access_token to get user info
    req.google({url: 'oauth2/v1/userinfo'}, userinfo => {

          var {name, email, picture} = userinfo;

          //remember to auto-login user through Google in future sessions
          res.cookie('autologin', 'true', { maxAge: 1000 * 3600 * 24 * 30 });


          User.findOne({email}, function(err, u){

              if (u){ //returning user, save user object to session
                req.session.user = {_id: u._id, email: u.email};

                console.log("Login: " + u.name + " " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());


                if (refresh_token)
                  User.update({_id:u._id}, {auth: refresh_token}).exec()

                return res.redirect(req.query.state || "/")

              } else { //new user
                User.create({
                  email,
                  name,
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

                            req.session.user = {_id: u._id, email: u.email};

                            if (refresh_token)
                              User.update({_id:u._id}, {auth: refresh_token}).exec()
                              
                          return res.redirect("/")
                       });

                    });

                 });

              }

          })

      })

    });

});




//end user's session and remove autologin
app.get('/logout', function(req, res) {
  req.session.destroy();

  res.cookie('autologin', 'true', { maxAge: '0' });

  return res.redirect("/")
});
