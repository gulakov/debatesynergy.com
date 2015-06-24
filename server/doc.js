var app = require('express').Router(), model = require('./models');
var Doc = model.Doc;

app.get('/read', function(req, res) {
    var fileId = req.query.id;

    Doc.findOne({id: fileId}, function (e, f) {
        if (!f)
            res.send("File not found");
        else if (f.userid != req.user._id)
            res.send("Access denied");
        else
            res.json({
                id:f._id,
                userid:f.userid,
                title:f.title,
                text:f.text
            });
        
    });
});


app.get('/create', function(req, res) {

    Doc.create({
        title: req.query.title,
        userid: req.user._id,
        text: ""
    }, function (e, f) {
        return res.json(f._id);
    });
});


app.post('/update', function(req, res) {

    var text = req.body.text;
    var title = req.body.title;
    var fileId = req.body.id;

    if (text)
        text = decodeURI(text);


   Doc.findOne({ _id: fileId}, function (e, f) {

        if (f && f.userid == req.user._id) {

            if (text)
                Doc.findOneAndUpdate({_id: fileId}, {text: text}, function (e, i) {
                });
            if (title)
                Doc.findOneAndUpdate({_id: fileId}, {title: title}, function (e, i) {
                });

        }

        return res.end();

    });
});


app.get('/search', function(req, res) {

    var data = req.query.data;
    
    Doc.find()
        .where({userid: req.user._id})
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
    var fileId = req.query.id;

    Doc.findOne({_id: fileId},function (e, f) {

        if (f && f.userid == req.user._id)
            Doc.findOneAndRemove({id: fileId}).exec(function(){ });

        return res.end();
    });
});


module.exports = app;