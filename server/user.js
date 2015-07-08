var app = require('express').Router(), model = require('./models');
var User = model.User, Doc = model.Doc;
module.exports = app;

app.all('/', function(req, res, next) {

    if (!req.user)
        res.send(false);
    else
        User.findOne({_id: req.user._id},
        function(err, u){

            res.json(u);
        })
});

app.all('/recover', auth, function(req, res, next) {

  Doc.find({userid: req.user._id}, function(e, docs) {

    var index = [];

    for(var i in docs)
      index.push({id: docs[i]._id, title: docs[i].title, type: "file"});


    User.update({_id: req.user._id}, {index: index }).exec();

    res.json(index);

  });

});

app.all('/update', auth, function(req, res) {

  User.update({_id: req.user._id},
      (req.body.custom_js) ?
        {custom_js: decodeURIComponent(req.body.custom_js),
        custom_css: decodeURIComponent(req.body.custom_css)} :
      (req.body.index) ?
        {index: JSON.parse(req.body.index) } : null
      ).exec();

  res.end();
});



app.get('/search', function(req, res) {
    var userinfo = { "$regex": req.query.userinfo, "$options": "i" } ;

    User.find({$or:[{email:userinfo}, {name: userinfo}]}, function(error, users){
        	res.json( users ? users.map(function(user){ return {id:user._id, email: user.email, text: user.name};}) : [] );
    })
});


app.get('/:email?', function(req, res) {
    User.findOne({email: req.params.email}, function(error, user) {
        if(user)
        	res.json({id:user._id, email: user.email, name: user.name, text: user.email, socket: user.socket});
        else
        	res.send("No user with email "+req.params.email)
    })
});





function auth(req, res, next) {
  if (!req.isAuthenticated())
    res.send("Login required");
  else
    return next();
}
