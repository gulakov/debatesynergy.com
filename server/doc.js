var app = require('express').Router(), model = require('./models');
var Doc = model.Doc, User = model.User;
module.exports = app;

app.get('/admin', function(req, res) {
  
   Doc.find().sort({'date_updated': 'desc'}).limit(5).exec(function (err, files) {
       
        return res.json(files.map(function(f){
        	return f._id + " " + f.text.substring(0,300);
        }));
  });



});


//takes callback from "Open With" in Google Drive to create/open file and sync
app.get('/readdrive', function(req, res) {
  res.send(req.query.state)
});

//takes doc ID, return doc text -- allowed if user is owner, share, or public/publicedit
app.get('/read', function(req, res) {
    var fileId = req.query.id;
    res.header("Content-Type", "application/json; charset=utf-8");

    Doc.findOne({_id: fileId}, function (e, f) {
          if (!f)
          return  res.send("Not found");

         if (f.share=="public" || f.share=="publicedit" || req.isAuthenticated() && (f.userid == req.user._id || f.shareusers.indexOf(req.user._id)>-1 ) )
            res.json({
                id: f._id,
                userid: f.userid,
                title: f.title,
                share: f.share,
                shareusers: f.shareusers,
                text: f.text
            });
        else
            res.send("Access denied");


    })
});

//takes optional doc title, create a blank doc and return its ID
app.get('/create', auth, function(req, res) {

    Doc.create({
        title: req.query.title || "New File",
        userid: req.user._id,
        text: ""
    }, function (e, f) {
        return res.json(f._id);
    });
});

//takes doc id and updated text, title, or shared, performs needed update
app.post('/update',  function(req, res) {

  var fileId = req.body.id;
  var text = req.body.text;
  var title = req.body.title;
  var share = req.body.share;
  var shareusers = req.body.shareusers;

  Doc.findOne({_id: fileId}, function (e, f) {

      if (!f)  return res.end();

      //update text body -- allowed for owner, share users, and publicedit
      if (text && (f.share == "publicedit" || req.user && f.userid == req.user._id || req.user._id && f.shareusers.indexOf(req.user._id)>-1 ) ){
        text = require('sanitize-html')(decodeURIComponent(text), {
          allowedTags: ['h1', 'h2', 'h3', 'h4', 'span', 'p', 'ul', 'li', 'u', 'b', 'i', 'br'],
          allowedAttributes: { 'span': ['style'] },
        });
        Doc.update({_id: fileId}, {text: text, date_updated: Date.now() }).exec();
      }

      //update doc title -- allowed for owner
      if (title && f.userid == req.user._id)
          Doc.update({_id: fileId}, {title: title, date_updated: Date.now() }).exec();

      //update share level -- allowed for owner
      if (share && f.userid == req.user._id)
          Doc.update({_id: fileId}, {share: share}).exec();

      //update share users -- allowed for owner
        if (shareusers && f.userid == req.user._id){
            Doc.update({_id: fileId}, {shareusers:  JSON.parse(shareusers) }).exec();
            console.log(req.user.email + " shared " + f.title + " with " +  shareusers);

              //TODO append file to share user's index if not existing and create an event
              //  User.update({_id: u._id}, {$push: {index: {"id": f._id, "title": f.title, "type": "file"} }},  {safe: true, upsert: true}).exec();
        }






      return res.end();

    });
});

//TODO shared docs & public
//takes a search string, search all user's docs text content
app.get('/search', auth, function(req, res) {

  var q = req.query.q;

  Doc.find({"userid": req.user._id, "text": {"$regex": q, "$options": "i" }}).sort('title').exec(function (err, files) {
        if (!files)
            return res.json([]);

        return res.json(files.map(function(f){
          var matchedPosition = f.text.toLowerCase().indexOf(q.toLowerCase());
          var matchedString = f.text.substring(f.text.lastIndexOf(" ", matchedPosition-40), matchedPosition)
            + "<b>"+q+"</b>" + f.text.substring(matchedPosition+q.length, f.text.indexOf(" ", matchedPosition+q.length + 40) );
           return {id: f._id, text: f.title, matchedString: matchedString };

        }));
  });

});

//input doc id, delete doc by removing ownership
app.get('/delete', auth, function(req, res){
    Doc.update({_id: req.query.id, userid: req.user._id}, {userid: "trash_"+ req.user._id }).exec(function(e, f){
      return res.end();

    });

});


//auth
function auth(req, res, next) {
  if (!req.isAuthenticated())
    return res.send("Login required");
  return next();
}
