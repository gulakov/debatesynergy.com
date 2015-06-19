var express = require('express');
var app = express.Router();

var model = require('./models');
var User = model.User, Round = model.Round;
//pass io from app.js
var io; 


app.get('/', function(req, res, next) {
   
     if (!req.user)
        return res.send("no login");

    var email = req.user.email;

    Round.find(
        { $or:[{aff1: email}, {aff2: email}, {neg1: email}, {neg2: email}, {judge1: email}] },
        //{sort: [['date', -1]]},
        function (e, foundRounds) {

        return res.json(foundRounds);


        var roundsAccepted = foundRounds.filter(function(i) {
            return (( i.aff1 == email && i.status_aff1) ||
                ( i.aff2 == email && i.status_aff2) ||
                ( i.neg1 == email && i.status_neg1) ||
                ( i.neg2 == email && i.status_neg2) ||
                ( i.judge1 == email && i.status_judge1));
        });

        return res.json(roundsAccepted);
    })



});

app.get('/create', function(req, res) {


    require("q").all([req.query.aff1, req.query.aff2, req.query.neg1, req.query.neg2, req.query.judge1].map(function(userInfo) {
       return User.findOne({$or:[{email: userInfo}, {name: userInfo}]})
    }))
    .done(function (foundUserList) {

        console.log(foundUserList);

        //if some email is not found, end process
        if(foundUserList.indexOf(null) > -1 )
            return res.json(foundUserList.map(function(i){return !i;}));



        Round.create({
            aff1: foundUserList[0].email,
            aff2: foundUserList[1].email,
            neg1: foundUserList[2].email,
            neg2: foundUserList[3].email,
            judge1: foundUserList[4].email

        }, function (e, newRoundJson) {

            var people = foundUserList[0].email + " " + foundUserList[1].email
                + " vs " + foundUserList[2].email + " " + foundUserList[3].email + " judged by " + foundUserList[4].email;

            people = people.replace(/\@[^ ]+/gi, '');


            for (var i=0;i<5;i++)

                io.sockets.to(foundUserList[i].socket).emit('round_youAreInvited', {
                    roundId: newRoundJson._id,
                    people: people
                });


            return res.json({roundId: newRoundJson._id, people: people  });



        });


        
    });

});
app.all('/read', function(req, res) {

    var roundId = req.param("id");

    Round.findOne({id: roundId}).exec(function (e, f) {


        return res.json(f);


    });

});



/*


app.all('/update', function(req, res) {



    var roundId = req.param("roundId");

    var sanitizeHtml = require("sanitize-html");

    var userId = req.session.passport.user;

    var userEmail;

    if (!userId || !roundId)
        return res.end();

    User.findOne({uid: userId}).exec(function (e, f) {
        if (f) userEmail = f.email;
    });


    Round.update({id: roundId}, {
        speech1AC: sanitizeHtml(req.param("speech1AC")),
        speech1NC: sanitizeHtml(req.param("speech1NC")),
        speech2AC: sanitizeHtml(req.param("speech2AC")),
        speech2NC: sanitizeHtml(req.param("speech2NC")),
        speech1NR: sanitizeHtml(req.param("speech1NR")),
        speech1AR: sanitizeHtml(req.param("speech1AR")),
        speech2NR: sanitizeHtml(req.param("speech2NR")),
        speech2AR: sanitizeHtml(req.param("speech2AR"))
    }).exec(function () {


        Round.findOne({id: roundId}).exec(function (e, f) {

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
                User.find().where({email: usersToPing[i]}).exec(function (e, f) {

                    if (req.session.passport.user != f[0].uid)
                        sails.sockets.emit(f[0].socket, 'round_newTextForPartner', {roundId: roundId});


                });


        });


    });


    return res.end("");

});


app.all('/updateScroll', function(req, res) {


    var roundId = req.param("roundId");
    var speechName = req.param("speechName");
    var scrollTo = req.param("scrollTo");

    var userId = req.session.passport.user;

    var userEmail;


    if (!userId || !roundId)
        return res.end();

    User.findOne({uid: userId}).exec(function (e, f) {
        userEmail = f.email;
    });

    if (speechName == "speech1AC")
        Round.update({id: roundId}, {scroll_1AC: scrollTo}).exec(function () {
        });
    if (speechName == "speech1NC")
        Round.update({id: roundId}, {scroll_1NC: scrollTo}).exec(function () {
        });
    if (speechName == "speech2AC")
        Round.update({id: roundId}, {scroll_2AC: scrollTo}).exec(function () {
        });
    if (speechName == "speech2NC")
        Round.update({id: roundId}, {scroll_2NC: scrollTo}).exec(function () {
        });
    if (speechName == "speech1NR")
        Round.update({id: roundId}, {scroll_1NR: scrollTo}).exec(function () {
        });
    if (speechName == "speech1AR")
        Round.update({id: roundId}, {scroll_1AR: scrollTo}).exec(function () {
        });
    if (speechName == "speech2NR")
        Round.update({id: roundId}, {scroll_2NR: scrollTo}).exec(function () {
        });
    if (speechName == "speech2AR")
        Round.update({id: roundId}, {scroll_2AR: scrollTo}).exec(function () {
        });


    Round.findOne({id: roundId}).exec(function (e, f) {

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


        if (f.status_judge1)
            usersToPing.push(f.judge1);


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
            User.find().where({email: usersToPing[i]}).exec(function (e, f) {

                if (req.session.passport.user != f[0].uid)
                    sails.sockets.emit(f[0].socket, 'round_newTextForEnemy', {
                        speechName: speechName,
                        speechPartial: speechPartial

                    });

            });


    });

    return res.end("");


});

app.all('/accept', function(req, res) {


    var userId = req.session.passport.user;

    if (!userId)
        return res.end();

    var roundId = req.param("roundId");
    var userEmail;

    User.findOne({uid: userId}).exec(function (e, f) {


        userEmail = f.email;
        userName = f.name.toLowerCase();


        Round.findOne({id: roundId}).exec(function (e, f) {

            if (f.aff1.toLowerCase() == userName || f.aff1 == userEmail)
                Round.update({id: roundId}, {status_aff1: true}).exec(function () {
                });
            if (f.aff2.toLowerCase() == userName || f.aff2 == userEmail)
                Round.update({id: roundId}, {status_aff2: true}).exec(function () {
                });
            if (f.neg1.toLowerCase() == userName || f.neg1 == userEmail)
                Round.update({id: roundId}, {status_neg1: true}).exec(function () {
                });
            if (f.neg2.toLowerCase() == userName || f.neg2 == userEmail)
                Round.update({id: roundId}, {status_neg2: true}).exec(function () {
                });
            if (f.judge1.toLowerCase() == userName || f.judge1 == userEmail)
                Round.update({id: roundId}, {status_judge1: true}).exec(function () {
                });


            //notify your friend that you accepted the round
            Round.findOne({id: roundId}).exec(function (e, f) {

                var usersToPing = [];

                if (f.status_aff1)
                    usersToPing.push(f.aff1);
                if (f.status_aff2)
                    usersToPing.push(f.aff2);
                if (f.status_neg1)
                    usersToPing.push(f.neg1);
                if (f.status_neg2)
                    usersToPing.push(f.neg2);
                if (f.status_judge1)
                    usersToPing.push(f.judge1);


                for (var i in usersToPing)

                    User.find().where({or: [{email: usersToPing[i]}, {name: usersToPing[i]}]}).exec(function (e, f) {


                        sails.sockets.emit(f[0].socket, 'round_inviteresponse', {roundId: roundId});


                    });


            });


            return res.end(roundId);


        });


    });


});

app.all('/resend', function(req, res) {


    var roundId = req.param("roundId");

    Round.findOne({id: roundId}).exec(function (e, f) {

        var usersToPing = [];

        if (!f.status_aff1)
            usersToPing.push(f.aff1);
        if (!f.status_aff2)
            usersToPing.push(f.aff2);
        if (!f.status_neg1)
            usersToPing.push(f.neg1);
        if (!f.status_neg2)
            usersToPing.push(f.neg2);
        if (!f.status_judge1)
            usersToPing.push(f.judge1);


        for (var i in usersToPing)

            User.find().where({or: [{email: usersToPing[i]}, {name: usersToPing[i]}]}).exec(function (e, f) {


                sails.sockets.emit(f[0].socket, 'round_youareinvited', {roundId: roundId});


            });


    });

    return res.end();

});
*/


app.all('/join', function(req, res) {

    if(!req.user)
        return res.send("no login for " +req.query.socket);
  
    User.findOneAndUpdate({_id: req.user._id}, {socket: req.query.socket}, function(){});

    res.end();
});


module.exports =  function (_io) {
    //pass io from app.js
    io = _io;

    return app;
};
