module.exports = app = require('express').Router(), {User,Doc} = require('./models');
var request = require('request');


//return the entire user object including file index for logged in user, or false if guest
app.all('/', function(req, res, next) {

    if (!req.session.user)
        res.send(false);
    else
        User.findOne({_id: req.session.user._id}, (err, u)=>{
            res.json(u);
        })
});

app.all('/index.js', function(req, res) {

    if (!req.session.user)
        res.send(`var u = false;`);
    else
        User.findOne({_id: req.session.user._id}, (err, u)=>{
            res.send(`var u = ${JSON.stringify(u)};`)
        })
});


//POST takes index or custom_js, custom_css as URIComponents, updates them for user
app.all('/update', auth, function(req, res) {

  var {userid="", index, custom_js, custom_css, options={}} = req.body!={} ? req.body : req.query;

  //if user has two tabs open with different indexes or accounts, prevent race
  //if (userid != req.session.user._id)
    //return res.send("User ID does not match");

  if (index)
    User.update({_id: userid}, {index, date_updated: Date.now()} ).exec();

  if (custom_js || custom_css)
    User.update({_id: userid},  {custom_js: decodeURIComponent(custom_js), custom_css: decodeURIComponent(custom_css), date_updated: Date.now()} ).exec();


   if ( options.sidebar)
    User.update({_id: userid},  { $set: { 'options.sidebar' : options.sidebar  }  }  ).exec();

   if ( options.debatetype)
    User.update({_id: userid},  { $set: { 'options.debatetype' : parseInt(options.debatetype)  }   }   ).exec();

  return res.end();
});



//takes notification type and related, clears from login notification
app.get('/notify', function(req, res) {

    var userId = req.session.user._id;
    var {roundId,fileId} = req.query;

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

    User.find({$or:[{email:userinfo}, {name: userinfo}]}, (e, users=[])=>{
        	res.json(  users.map(u=>{ return {id:u._id, email: u.email, text: u.name} } )  );
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

//URL takes /user/sample@email.com, returns data for that user
app.get('/:id?', function(req, res) {
    User.findOne( { $or:[ {email: req.params.id}, {_id: req.params.id}] }, function(error, user) {
        if(user)
        	res.json({id:user._id, email: user.email, name: user.name, socket: user.socket});
        else
        	res.send("No user found")
    })
});
