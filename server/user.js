var express = require('express');
var app = express.Router();

var model = require('./models');
var User = model.User;

app.all('/', function(req, res, next) {

    if (!req.user)
        res.send(false);
    else
        res.json(req.user);

       // User.findById(req.user._id, function(err, u) {

});


app.all('/update', function(req, res) {

	if (!req.user)
            return res.send("No user");

    if (req.body.index)
            User.findOneAndUpdate(
                {_id: req.user._id},
                { index: req.body.index},
                function(err, u){
                    res.json(u);
                })
    else
        res.send("No index")

        /*    User.update({uid: req.session.passport.user}, {
                debatetype: req.query.debatetype,
                teamname: req.query.teamname
            }).exec(function (err, f) {
            });*/


});



app.get('/:email?', function(req, res) {
    User.findOne({email: req.query.email}, function(error, user) {
        if(user)
        	res.json(user);
        else
        	res.send("No user with email "+req.query.email)
    })
});




module.exports = app;
