var app = require('express').Router(), model = require('./models');
var Topic = model.Topic, User = model.User;
module.exports = app;

//auth
function auth(req, res, next) {
  if (!req.session.user)
    return res.send("Login required");
  return next();
}

app.get('/read', auth, function(req, res) {

    Topic.findOne({_id: req.query.id}, function (e, f) {
        if (!f)
          return  res.json("Not found");

       
            res.json(f);
       })
});


app.get('/list', function(req, res) {

    Topic.find({}, function (e, f) {
             res.send(f);
    })
});


//takes title, creates team with you as admin and returns its id
app.get('/create', auth, function(req, res) {
  var title = req.query.title;
  var text = req.query.text;


    Topic.create({
        title: req.query.title,
        text: text,
        ownerid: req.session.user._id
    }, function (e, f) {
        return res.json(f._id);
    });
});

//takes users and admins emails and id, updates that team if you are an admin
app.get('/update', auth, function(req, res) {

  Team.findOne({ _id: req.query.id}, function (e, f) {

      if (!f)
        return res.end();
      if (f.admins.indexOf(req.session.user.email)==-1)
        return res.end();

      Team.update({_id: req.query.id}, {users: JSON.parse(req.query.users), admins: JSON.parse(req.query.admins) }).exec();


    });
});
