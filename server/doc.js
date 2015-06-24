var app = require('express').Router(), model = require('./models');
var Doc = model.Doc;

app.get('/read', function(req, res) {

        var userId = req.user._id;
        var fileId = req.query.id;

        if (userId) {

            Doc.findOne({userid: userId, _id: fileId}, function (e, f) {

                if (f)
                    res.json({
                        id:f._id,
                        userid:f.userid,
                        title:f.title,
                        text:f.text
                    });
                else
                    res.send("Access denied")
            });

        } else {

            return res.end("Not logged in");
        }

    });


app.get('/create', function(req, res) {

        var title = req.query.title;


        Doc.create({
            title: title,
            userid:  req.user.id,
            text: ""
        }, function (e, f) {
	        return res.json(f._id);
        });


    });


app.post('/update', function(req, res) {

        var text = req.body.text;
        var title = req.body.title;
        var fileId = req.body.id;
        var userid = req.user._id;

        if (text)
            text = decodeURI(text);


       Doc.findOne({ _id: fileId}, function (e, f) {

            if (f && f.userid == userid) {

                if (text)
                    Doc.findOneAndUpdate({_id: fileId}, {text: text}, function (e, i) {
                    });
                if (title)
                    Doc.findOneAndUpdate({_id: fileId}, {title: title}, function (e, i) {
                    });

            }

            return res.send("Updated ");

        });

    });


app.get('/search', function(req, res) {

        var data = req.query.data;
        var userid = req.user._id;
        Doc.find()
            .where({userid: userid})
            .limit(10)
            .sort('title')
            .exec(function (err, files) {


                if (!files.length)
                    res.end();

                var fileTitles = [];

                for (var i in files)
                    if (files[i].text.indexOf(data) > -1)
                        fileTitles.push(files[i].title);

                return res.json(fileTitles);
            });

    });


app.get('/delete',  function(req, res) {

        var userId = req.user._id;
        var fileId = req.query.id;

        Doc.findOne({_id: fileId},function (e, f) {

            if (f && f.userid == userId)
                Doc.findOneAndRemove({id: fileId}).exec(function () {
                });

            return res.end();

        });


});



module.exports = app;
