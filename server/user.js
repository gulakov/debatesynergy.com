var app = require('express').Router(), model = require('./models');
var User = model.User;

app.all('/', function(req, res, next) {

    if (!req.user)
        res.send(false);
    else
        User.findOne({_id: req.user._id},               
            function(err, u){
                res.json(u);
            })



       // User.findById(req.user._id, function(err, u) {

});


app.all('/update', auth, function(req, res) {

    if (req.body.index)
            User.findOneAndUpdate(
                {_id: req.user._id},
                {index: req.body.index},
                function(err, u){
                    res.json(u);
                })
    else if (req.body.custom_js)
          User.findOneAndUpdate(
                {_id: req.user._id},
                {custom_js: req.body.custom_js, 
                 custom_css: req.body.custom_css},
                function(err, u){
                    res.json(u);
                })


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



module.exports = app;
