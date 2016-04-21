var app = require('express').Router(), model = require('./models');
var Doc = model.Doc, User = model.User,  ObjectID = require('mongodb').ObjectID;
var request = require('request');
module.exports = app;

app.get('/admin', function(req, res) {



  request({
    url: 'https://www.google.com/m8/feeds/contacts/default/full',
    qs: {
      alt: "json",
      v: "3.0",
      q: req.query.q

    },
    headers: {
      'Authorization': 'Bearer ya29..ygIr6a9ANZDNoycmQOu5SnJD_sRkqO4AWJnHgwxwf5TEsszYEnZ32uGsGgkVlxm_7A'
    }},  function (error, response, body){
      return res.send(body)

      var body = JSON.parse(body);

      var contacts = body.feed.entry.map(function(i){
        return  i["gd$email"]  && {name:  i["gd$name"] ? i["gd$name"]["gd$fullName"]["$t"] : "", email: i["gd$email"][0].address }
      })

      res.json(contacts)
  })

// + req.session.access_token
  User.find().sort({'date_created': 'asc'}).exec(function (err, files) {
    //   return res.json(files);
 });

  /*
   Doc.find({ userid: { $not: /55926eec0589b40a0f835c80/} } ).sort({'date_updated': 'desc'}).limit(20).exec(function (err, files) {
        return res.json(files.map(function(f){
        	return f._id + " " + f.text.substring(0,500);
        }));
  });
  */

});



app.get('/drivelist', function(req, res) {


  request({
    url: 'https://www.googleapis.com/drive/v2/files',
    qs: {
      q: "mimeType contains 'document'"
    },
    headers: {
      'Authorization': 'Bearer ' + req.session.access_token
    }},  function (error, response, body){



      res.send(body)
  })

});


//takes callback from "Open With" in Google Drive to create/open file and sync
app.get('/readdrive', function(req, res) {
  var state = JSON.parse(req.query.state),
  fileId = state.exportIds || state.ids,
  access_token = req.session.access_token;

  //takes fileId, request google doc file metadata
  request({
    url: 'https://www.googleapis.com/drive/v3/files/' + fileId,
    headers: {
      'Authorization': 'Bearer ' + req.session.access_token
    }},  function (error, response, body){
      var body = JSON.parse(body);
      if (body.error) //unauthorized
        return res.redirect('/')


      //takes google doc, returns file HTML
      request({
          uri: body.exportLinks["text/html"],
          headers: {
            'Authorization': 'Bearer ' + req.session.access_token
        }}, function (error, response, body) {


                //updated google doc HTML with new HTML
               request({
                 uri: 'https://www.googleapis.com/upload/drive/v2/files/'+fileId,
                 method: 'PUT',
                 qs: {
                   uploadType: 'media'
                 },
                 form:  body.replace(/(and)/gi,'Gulakov'),
                 headers: {
                   'Content-Type': 'application/vnd.google-apps.document',
                   'Authorization': 'Bearer ' + tokens.access_token
                 }},  function (error, response, body){



                   res.redirect(JSON.parse(body).alternateLink)
               })


        });

  })


});


//takes doc ID, return doc text -- allowed if user is owner, share, or public/publicedit
app.get('/read', function(req, res) {
    var fileId = req.query.id;

    Doc.findById(fileId, function (e, f) {
          if (!f)
          return  res.send("Not found");

         if (f.share=="public"  || req.session.user && (f.userid == req.session.user._id || req.session.user && f.shareusers.map(function(i){return i.id}).indexOf(req.session.user._id)>-1 ) )
            res.json({
                id: f._id,
                userid: f.userid,
                title: f.title,
                share: f.share,
                shareusers: f.shareusers,
                date_created: f.date_created,
                date_updated: f.date_updated,
                text: f.text
            });
        else{
            return res.status(401).send("Access denied");
          }


    })
});

//takes optional doc title, create a blank doc and return its ID
app.get('/create', auth, function(req, res) {

    Doc.create({
        title: req.query.title || "New File",
        userid: req.session.user._id,
        text: ""
    }, function (e, f) {
        return res.json(f._id);
    });
});

//takes doc id and updated text, title, or shared, performs needed update
app.post('/update',  function(req, res) {

  var userId = req.session.user ? req.session.user._id : false;
  var fileId = req.body.id;
  var text = req.body.text;
  var title = req.body.title;
  var share = req.body.share;
  var shareusers = req.body.shareusers;
  var shareusers_remove_me = req.body.shareusers_remove_me;

  Doc.findOne({_id: fileId}, function (e, f) {

      if (!f)  return res.end();

      //update text body -- allowed for owner, share users, and publicedit
      if (text && (f.userid == userId || f.shareusers.map(function(i){return i.id}).indexOf(userId)>-1 ) ){
        text = require('sanitize-html')(decodeURIComponent(text), {
          allowedTags: ['h1', 'h2', 'h3', 'h4', 'span', 'p', 'ul', 'li', 'u', 'b', 'i', 'br'],
          allowedAttributes: { 'span': ['style'] },
        });
        Doc.update({_id: fileId}, {text: text, date_updated: Date.now() }).exec();
      }

      //update doc title -- allowed for owner
      if (title && f.userid == userId)
          Doc.update({_id: fileId}, {title: title, date_updated: Date.now() }).exec();

      //update share level -- allowed for owner
      if (share && f.userid == userId)
          Doc.update({_id: fileId}, {share: share}).exec();

      //TODO if (share == "team")

      //update share users to remove self -- allowed for current user if shared with
      if (shareusers_remove_me && f.shareusers.map(function(i){return i.id}).indexOf(userId)>-1)
          Doc.update({_id: fileId}, {shareusers: f.shareusers.filter(function(i){ return i.id!=userId} ) }).exec();

      //update share users -- allowed for owner
        if (shareusers && f.userid == userId){
            Doc.update({_id: fileId}, {shareusers:  (shareusers) }).exec();

            for (var i in shareusers)
              User.update (
                  {_id: new ObjectID(shareusers[i].id)},
                  {$push: {'notifications': {
                    'type':'doc_share',
                    'fileId': fileId,
                    'title': f.title,
                    'owner': req.session.user.name
                  }}}
              ).exec();

            console.log(req.session.user.email + " shared " + f.title + " with " +  JSON.stringify(shareusers));

              //TODO append file to share user's index if not existing and create an event
              //  User.update({_id: u._id}, {$push: {index: {"id": f._id, "title": f.title, "type": "file"} }},  {safe: true, upsert: true}).exec();
        }






      return res.end();

    });
});

//TODO shared docs & public
//takes a search string, search all user's docs text content
app.get('/search', auth, function(req, res) {
  //TODO files shared with teams i'm on, public files in users tree and speeches

  var q = req.query.q, userId = req.session.user._id;

  // SEARCH STRING OF WORD/S, SEPARATED BY NON_ALPHANUMERICS, CASE INSENSITIVE, TO SEARCH MATCHING ALL WORDS, IN ANY ORDER,
  // EXCEPT TREAT MATCHING SUBSTRING WORDS "IN QUOTES" IN THAT EXACT ORDER
  q2 = "(?=.*"+q.match(/"([^"]+)"|[\w]+/gi).join(")(?=.*").replace(/\"/g,'')+").+"

  console.log(q2)

  Doc.find({
      $or: [{"userid": userId, "text": {"$regex": q2, "$options": "gi" }},
       {  "share": "specific", "shareusers": { $elemMatch: {"id": userId} }, "text": {"$regex": q2, "$options": "gi" }     }]
  }).sort({'date_updated': 'desc'}).exec(function (err, files) {
        if (!files)
            return res.json([]);


        return res.json(files.map(function(f){


            f.text = f.text.replace(/<[^>]*>/gi,'')


          var matchedPosition = f.text.toLowerCase().indexOf(q.match(/(\w+)/gi)[0].toLowerCase());
      //    var matchedString = f.text.substring(f.text.lastIndexOf(" ", matchedPosition-40), matchedPosition)
      //      + "<b>"+q+"</b>" + f.text.substring(matchedPosition+q.length, f.text.indexOf(" ", matchedPosition+q.length + 40) );

            matchedString = f.text.substring(matchedPosition-100, matchedPosition+100)
           return {id: f._id, text: f.title, matchedString: matchedString };

        }));
  });

});

//input doc id, delete doc by removing ownership
app.get('/delete', auth, function(req, res){
    Doc.update({_id: req.query.id, userid: req.session.user._id}, {userid: "trash_"+ req.session.user._id }).exec(function(e, f){
      return res.end();

    });

});


//auth
function auth(req, res, next) {
  if (!req.session.user)
    return res.status(401).send("Login required");
  return next();
}
