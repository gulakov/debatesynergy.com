var app = require('express').Router(), model = require('./models');
var User = model.User, Doc = model.Doc;
module.exports = app;

//return the entire user object including file index for logged in user, or false if guest
app.all('/', function(req, res, next) {

    if (!req.user)
        res.send(false);
    else
        User.findOne({_id: req.user._id},
        function(err, u){
            res.json(u);
        })
});

app.all('/index.js', function(req, res, next) {

    if (!req.user)
        res.send("var u = "+ false);
    else
        User.findOne({_id: req.user._id},
        function(err, u){
            res.send("var u = "+ JSON.stringify(u))
        })
});

//repopulate current user's index with all files in database belonging to that user, losing folders
app.all('/recover', auth, function(req, res, next) {

  Doc.find({userid: req.user._id}, function(e, docs) {

    var index = [];

    for(var i in docs)
      index.push({id: docs[i]._id, title: docs[i].title, type: "file"});


    User.update({_id: req.user._id}, {index: index }).exec();

    res.json(index);

  });

});

//POST takes index or custom_js, custom_css as URIComponents, updates them for user
app.all('/update', auth, function(req, res) {
  if (req.body.index && req.body._id != req.user._id)
    return res.end(); //two users in browser tabs error fix

  User.update({_id: req.user._id},
      (typeof req.body.index != "undefined") ?
        {index: req.body.index , date_updated: Date.now()} :
      (req.body.sidebar) ?
        {options: [req.body.sidebar] , date_updated: Date.now()} :
      (typeof req.body.custom_js != "undefined") ?
        {custom_js: decodeURIComponent(req.body.custom_js),
          custom_css: decodeURIComponent(req.body.custom_css), date_updated: Date.now()} : null
      ).exec();

  res.end();
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
  if (!req.isAuthenticated())
    return res.send("Login required");
  return next();
}
