var app = require('express').Router(), model = require('./models');
var Doc = model.Doc, User = model.User;
module.exports = app;

// return doc of given ID only if user is owner, share, or public doc
app.get('/read', function(req, res) {
    var fileId = req.query.id;
    res.header("Content-Type", "application/json; charset=utf-8");

    Doc.findOne({_id: fileId}, function (e, f) {
        if (!f)
          return  res.json("Not found");

         if(f.userid == req.user._id || f.share.indexOf(req.user.email)>-1
            || f.share.indexOf("public")>-1 || f.share.indexOf("public edit")>-1)
            res.json({
                id:f._id,
                userid:f.userid,
                title:f.title,
                text:f.text,
                share: f.share
            });
        else
            res.send("Access denied");


    })
});

//create a blank doc with a given title and return ID
app.get('/create', function(req, res) {

    Doc.create({
        title: req.query.title,
        userid: req.user._id,
        text: ""
    }, function (e, f) {
        return res.json(f._id);
    });
});

//for given doc id, update text, title, or shared
app.post('/update', function(req, res) {

  var fileId = req.body.id;
  var text = req.body.text;
  var title = req.body.title;
  var share = req.body.share;

  Doc.findOne({ _id: fileId}, function (e, f) {

      if (!f)  return res.end();

      //update text body -- allowed for owner, collaborators, and "public edit"
      if (text && (f.userid == req.user._id || f.share.indexOf(req.user.email)>-1
       || f.share.indexOf("public edit")>-1) ){
          Doc.update({_id: fileId}, {text: decodeURIComponent(text)}).exec();
          return res.end();
        }

      //update doc title -- allowed for owner
      if (title  && f.userid == req.user._id){
          Doc.update({_id: fileId}, {title: title}).exec();
          return res.end();
        }

      //udpate whom to share with -- allowed for owner
      if (share && f.userid == req.user._id){

          share = share.split(',').map(function(i){return i.trim();});
          Doc.update({_id: fileId}, {share: []}).exec();

          for (var i in share)
            if (share[i]=="public"||share[i]=="public edit")
              Doc.update({_id: fileId}, {$push: {share: share[i]}},  {safe: true, upsert: true}).exec();
            else
              User.findOne({$or:[{email: share[i]}, {name: share[i]}]}, function (e, u) {
                //find the users to share with by email
                if (u){
                  console.log(req.user.email + " shared " + fileId + " with " + u.email)

                  Doc.update({_id: fileId}, {$push: {share: u.email}},  {safe: true, upsert: true}).exec();

                  //and append file to share user's index if not existing
                  if(JSON.stringify(u.index).indexOf(f._id)==-1)
                    User.update({_id: u._id},
                      {$push: {index: {"id": f._id, "title": f.title, "type": "file"} }},  {safe: true, upsert: true}).exec();

                  //TODO: authorize sharing with users, and updtae their tree refresh so their sessions update doesnt overrite

                } else  //if user doesnt exist for that email, delete them and decrease index
                   share.splice(i--,1);


               //after looping thru all, return valid users
               if (i==share.length-1)
                 return res.json(share)



            });
          }





    });
});

//takes a search string, search all user's docs text content
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

//delete doc id by removing ownership
app.get('/delete', function(req, res){
    Doc.update({_id: req.query.id, userid: req.user._id}, {userid: "trash"}).exec();

    res.end();
});
