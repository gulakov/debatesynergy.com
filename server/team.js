var app = require('express').Router(), model = require('./models');
var Team = model.Team, User = model.User;
module.exports = app;

//auth
function auth(req, res, next) {
  if (!req.isAuthenticated())
    return res.send("Login required");
  return next();
}

app.get('/read', auth, function(req, res) {

    Team.findOne({_id: req.query.id}, function (e, f) {
        if (!f)
          return  res.json("Not found");

         if( f.users.indexOf(req.user.email)>-1 || f.admins.indexOf(req.user.email)>-1 ) )
            res.json(f);
        else
            res.send("Access denied");
    })
});

app.get('/create', auth, function(req, res) {

    Team.create({
        title: req.query.title,
        admins: [req.user.email]
    }, function (e, f) {
        return res.json(f._id);
    });
});

app.get('/update', auth, function(req, res) {

  Team.findOne({ _id: req.query.id}, function (e, f) {

      if (!f)
        return res.end();
      if (f.admins.indexOf(req.user.email)==-1)
        return res.end();

      Team.update({_id: req.query.id}, {users: JSON.parse(req.query.users), admins: JSON.parse(req.query.admins) }).exec();


    });
});
