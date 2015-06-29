var app = require('express').Router(), model = require('./models');
var User = model.User;
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


app.all('/update', auth, function(req, res) {

  User.update({_id: req.user._id},
      (req.body.custom_js) ?
        {custom_js: decodeURIComponent(req.body.custom_js),
        custom_css: decodeURIComponent(req.body.custom_css)} :
      (req.body.index) ? {index: JSON.parse(req.body.index) } : null
      ).exec();

  res.end();
});


app.get('/:email?', function(req, res) {
    User.findOne({email: req.query.email}, function(error, user) {
        if(user)
        	res.json(user);
        else
        	res.send("No user with email "+req.query.email)
    })
});


function auth(req, res, next) {
  if (!req.isAuthenticated())
    res.send("Login required");
  else
    return next();
}
