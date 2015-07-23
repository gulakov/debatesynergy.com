var app = require('express').Router(), model = require('./models');
var Doc = model.Doc, User = model.User;
module.exports = app;

//auth
function auth(req, res, next) {
  if (!req.isAuthenticated())
    return res.send("Login required");
  return next();
}


//takes callback from "Open With" in Google Drive to create/open file and sync
app.get('/readdrive', function(req, res) {
  res.send(req.query.state)
});

//takes doc ID, return doc text -- allowed if user is owner, share, or public doc
app.get('/read', function(req, res) {
    var fileId = req.query.id;
    res.header("Content-Type", "application/json; charset=utf-8");

    Doc.findOne({_id: fileId}, function (e, f) {
        if (!f)
          return  res.json("Not found");

         if(f.share.indexOf("public")>-1 || f.share.indexOf("public edit")>-1 ||
            req.isAuthenticated() && (f.userid == req.user._id || f.share.indexOf(req.user.email)>-1 ) )
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
app.post('/update', auth, function(req, res) {

  var fileId = req.body.id;
  var text = req.body.text;
  var title = req.body.title;
  var share = req.body.share;

  Doc.findOne({ _id: fileId}, function (e, f) {

      if (!f)  return res.end();

      //update text body -- allowed for owner, collaborators, and "public edit"
      if (text && (f.userid == req.user._id || f.share.indexOf(req.user.email)>-1
       || f.share.indexOf("public edit")>-1) ){
          Doc.update({_id: fileId}, {text: decodeURIComponent(text), date_updated: Date.now() }).exec();
          return res.end();
        }

      //update doc title -- allowed for owner
      if (title  && f.userid == req.user._id){
          Doc.update({_id: fileId}, {title: title, date_updated: Date.now() }).exec();
          return res.end();
        }

      //update whom to share with -- allowed for owner
      if (share && f.userid == req.user._id){

          share = share.split(',').map(function(i){return i.trim();});
          Doc.update({_id: fileId}, {share: [], date_updated: Date.now() }).exec();

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

                  //TODO: authorize sharing with users, and update their tree refresh so their sessions update doesnt overrite

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

//takes doc id, delete doc by removing ownership
app.get('/delete', auth, function(req, res){
    Doc.update({_id: req.query.id, userid: req.user._id}, {userid: "trash_"+ req.user._id }).exec(function(e, f){
      return res.end();

    });


});
