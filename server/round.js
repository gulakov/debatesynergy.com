var app = require('express').Router(),
  model = require('./models');

var io, User = model.User,
  ObjectID = require('mongodb').ObjectID,
  Round = model.Round;
module.exports = function(_io) {
  //pass io from app.js
  io = _io;
  return app;
};

//auth
function auth(req, res, next) {
  if (!req.isAuthenticated())
    return res.send("Login required");
  return next();
}


//return all rounds accepted by this user
app.get('/', function(req, res, next) {

  var userId = req.user._id;

  Round.find({
      $or: [{
        "aff1.id": userId, "aff1.status": true
      }, {
        "aff2.id": userId, "aff2.status": true
      }, {
        "neg1.id": userId, "neg1.status": true
      }, {
        "neg2.id": userId, "neg2.status": true
      }, {
        "judges": { $elemMatch: {"id": userId, "status": true} }
      }]
    },
    //{sort: [['date', -1]]}, // not returning
    function(e, foundRounds) {

      return res.send(foundRounds);


      var roundsAccepted = foundRounds.filter(function(i) {
        return ((i.aff1 == email && i.status_aff1) ||
          (i.aff2 == email && i.status_aff2) ||
          (i.neg1 == email && i.status_neg1) ||
          (i.neg2 == email && i.status_neg2) ||
          (i.judges == email && i.status_judges));
      });

      //return res.json(roundsAccepted);
    })



});



app.all('/read', auth, function(req, res) {

  Round.findOne({
    _id: req.query.id
  }, function(e, f) {
    return res.json(f);
  });

});



app.get('/create', auth, function(req, res) {

  require("q").all([req.query.aff1, req.query.aff2, req.query.neg1, req.query.neg2].concat(req.query.judges).map(function(userId) {
      return userId && userId.length ? User.findById(userId) : false;
    }))
    .done(function(foundUsersFull) {

      foundUsers = foundUsersFull.map(function(i) {
        return {
          name: i.name || "",
          id: i ? i._id.toString() : "",
          status: false
        }
      })

      console.log(foundUsers);
      var speech_init = {text: "", scroll: 0};

      Round.create({
        aff1: foundUsers[0],
        aff2: foundUsers[1],
        neg1: foundUsers[2],
        neg2: foundUsers[3],
        judges: foundUsers.slice(4),
        speech1AC: speech_init,
        speech1NC: speech_init,
        speech2AC: speech_init,
        speech2NC: speech_init,
        speech1NR: speech_init,
        speech1AR: speech_init,
        speech2NR: speech_init,
        speech2AR: speech_init

      }, function(e, newRoundJson) {

        var people = foundUsers[0].name + " " + foundUsers[1].name + " vs " + foundUsers[2].name + " " + foundUsers[3].name + " judged by " +
          foundUsers.slice(4).map(function(i) {  return i.name  }).join(", ");

        for (var i in foundUsersFull)
          io.to("/#" + foundUsersFull[i].socket).emit('round_youAreInvited', {
            roundId: newRoundJson._id,
            people: people
          });

        return res.json({
          roundId: newRoundJson,
          people: people
        });

      });
    });
});


app.all('/accept', auth, function(req,  res) {

  var userId = req.user._id;
  var roundId = req.query.roundId;

  Round.findById(roundId).exec(function(e, roundJSON) {
    if (!roundJSON)
      return res.end("Round not found " + roundId);

    if (roundJSON.aff1.id == userId)
      Round.update({
        _id: roundId
      }, {
        $set: {
          "aff1.status": true
        }
      }, function() {});
    if (roundJSON.aff2.id == userId)
      Round.update({
        _id: roundId
      }, {
        $set: {
          "aff2.status": true
        }
      }, function() {});
    if (roundJSON.neg1.id == userId)
      Round.update({
        _id: roundId
      }, {
        $set: {
          "neg1.status": true
        }
      }, function() {});
    if (roundJSON.neg2.id == userId)
      Round.update({
        _id: roundId
      }, {
        $set: {
          "neg2.status": true
        }
      }, function() {});

    var judges_index = roundJSON.judges.map(function(i) {
      return i.id
    }).indexOf(userId);
    //if (judges_index > -1)


    Round.update({
      "_id": new ObjectID(roundId),
      "judges":  { $elemMatch: {"id": userId} }
    }, {
      $set: {
        "judges.$.status": true
      }
    }, function() {});

    var usersToPing = [roundJSON.aff1, roundJSON.aff2, roundJSON.neg1, roundJSON.neg2].concat(roundJSON.judges)

    for (var i in usersToPing)

      User.findById(usersToPing[i].id, function(e, f) {
      if (f)
        io.to("/#" + f.socket).emit('round_inviteResponse', {
          roundId: roundId
        });

    });


    //return res.end(roundId);
  });

});


app.post('/update', auth, function(req, res) {

  var userId = req.user._id;
  var userEmail = req.user.email;
  var roundId = req.body.roundId;
  var sanitizeHtml = require("sanitize-html");


  Round.findOneAndUpdate({
    _id: roundId
  }, {
    speech1AC: sanitizeHtml(req.body.speech1AC),
    speech1NC: sanitizeHtml(req.body.speech1NC),
    speech2AC: sanitizeHtml(req.body.speech2AC),
    speech2NC: sanitizeHtml(req.body.speech2NC),
    speech1NR: sanitizeHtml(req.body.speech1NR),
    speech1AR: sanitizeHtml(req.body.speech1AR),
    speech2NR: sanitizeHtml(req.body.speech2NR),
    speech2AR: sanitizeHtml(req.body.speech2AR)
  }, function(e, f) {

    if (!f)
      return res.end();


    var usersToPing = [];

    //figure out my partner

    if (userEmail == f.aff1 || userEmail == f.aff2) {

      if (f.status_aff1)
        usersToPing.push(f.aff1);
      if (f.status_aff2)
        usersToPing.push(f.aff2);

    } else if (userEmail == f.neg1 || userEmail == f.neg2) {

      if (f.status_neg1)
        usersToPing.push(f.neg1);
      if (f.status_neg2)
        usersToPing.push(f.neg2);

    }


    for (var i in usersToPing)
      User.findOne({
        email: usersToPing[i]
      }, function(e, f) {

        if (!e && f != "undefined" && req.user._id != f._id)
          io.to("/#" + f.socket).emit('round_newTextForPartner', {
            round: f
          });

      });



  });


  return res.end();

});
/*
app.get('/updateScroll', auth, function(req, res) {


    var roundId = req.query.roundId;
    var speechName = req.query.speechName;
    var scrollTo = req.query.scrollTo;



    var roundId = req.body.roundId;

    var userEmail = req.user.email;


    if (speechName == "speech1AC")
        Round.findOneAndUpdate({_id: roundId}, {scroll_1AC: scrollTo},function () {
        });
    if (speechName == "speech1NC")
        Round.findOneAndUpdate({_id: roundId}, {scroll_1NC: scrollTo},function () {
        });
    if (speechName == "speech2AC")
        Round.findOneAndUpdate({_id: roundId}, {scroll_2AC: scrollTo},function () {
        });
    if (speechName == "speech2NC")
        Round.findOneAndUpdate({_id: roundId}, {scroll_2NC: scrollTo},function () {
        });
    if (speechName == "speech1NR")
        Round.findOneAndUpdate({_id: roundId}, {scroll_1NR: scrollTo},function () {
        });
    if (speechName == "speech1AR")
        Round.findOneAndUpdate({_id: roundId}, {scroll_1AR: scrollTo},function () {
        });
    if (speechName == "speech2NR")
        Round.findOneAndUpdate({_id: roundId}, {scroll_2NR: scrollTo},function () {
        });
    if (speechName == "speech2AR")
        Round.findOneAndUpdate({_id: roundId}, {scroll_2AR: scrollTo},function () {
        });


    Round.findOne({_id: roundId},function (e, f) {

        var usersToPing = [];

        //figure out enemy+judge

        if (userEmail == f.aff1 || userEmail == f.aff2) {

            if (f.status_neg1)
                usersToPing.push(f.neg1);
            if (f.status_neg2)
                usersToPing.push(f.neg2);

        } else if (userEmail == f.neg1 || userEmail == f.neg2) {

            if (f.status_aff1)
                usersToPing.push(f.aff1);
            if (f.status_aff2)
                usersToPing.push(f.aff2);

        }


        if (f.status_judges)
            usersToPing.push(f.judges);


        //speech partial to send
        var speechPartial;

        if (speechName == "speech1AC")
            speechPartial = f.speech1AC;
        if (speechName == "speech1NC")
            speechPartial = f.speech1NC;
        if (speechName == "speech2AC")
            speechPartial = f.speech2AC;
        if (speechName == "speech2NC")
            speechPartial = f.speech2NC;
        if (speechName == "speech1NR")
            speechPartial = f.speech1NR;
        if (speechName == "speech1AR")
            speechPartial = f.speech1AR;
        if (speechName == "speech2NR")
            speechPartial = f.speech2NR;
        if (speechName == "speech2AR")
            speechPartial = f.speech2AR;

        speechPartial = speechPartial.substring(0, scrollTo);


        for (var i in usersToPing)
            User.findOne({email: usersToPing[i]}, function (e, f) {

                if (req.user._id != f._id)
                    io.to("/#"+f.socket).emit( 'round_newTextForEnemy', {
                        speechName: speechName,
                        speechPartial: speechPartial

                    });

            });


    });

    return res.end();


});
*/

app.get('/resend', auth, function(req, res) {
//TODO accept new changed people to send to

  var roundId = req.query.roundId;

  Round.findOne({
    _id: roundId
  }, function(e, f) {

    var usersToPing = [];

    if (!f.status_aff1)
      usersToPing.push(f.aff1);
    if (!f.status_aff2)
      usersToPing.push(f.aff2);
    if (!f.status_neg1)
      usersToPing.push(f.neg1);
    if (!f.status_neg2)
      usersToPing.push(f.neg2);
    if (!f.status_judges)
      usersToPing.push(f.judges);


    for (var i in usersToPing)

      User.findOne({
      email: usersToPing[i]
    }, function(e, f) {

      io.to("/#" + f.socket).emit('round_youareinvited', {
        roundId: roundId
      });


    });


  });

  return res.end();

});


app.all('/join', auth, function(req, res) {


  User.findOneAndUpdate({
    _id: req.user._id
  }, {
    socket: req.query.socket
  }, function() {});

  res.end();
});
