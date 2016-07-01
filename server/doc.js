module.exports = app = require('express').Router(), {Doc, User} = require('./models');
var request = require('request'), fs = require('fs');


//takes doc ID, return doc text -- allowed if user is owner, share, or public/publicedit
app.get('/read', function(req, res) {
    var fileId = req.query.id;


    var userId = req.session.user ? req.session.user._id : "";

    Doc.findOne({$or: [ {"_id": fileId.length == 24 ? fileId : null},
      {"token":  fileId },
			{"url":  fileId.replace(/[\W_]+/g," ").toLowerCase() },
			{"title": {"$regex": "^"+fileId.replace(/\+/g,' ')+"$", "$options": "i" }} ] }, (e, f)=>{

        if (!f)
            return res.status(404).send("Not found");

        //to read file, must be owner or share user, or file is public
        if (f.share!="public" && f.userid != userId && !f.shareusers.filter(i => i.id==userId).length)
          return res.status(401).send("Access denied");




                      //    console.log(Object.keys(req.session))


          //  } else{
                f['id']=f._id; //both ways work

                //send file objects
                 res.json(f);





                  var partial = req.query.partial || false;

                  var partialByName = partial ? f.text.substr(f.text.toLowerCase().search( ">"+partial.toLowerCase()+"<" )-20)
                                      : f.text.substr(0,10000);



                  partialByName = partialByName.substr(partialByName.search(/(<h1>|<h2>|<h3>)/i))


                  var endBlock = partialByName.substr(500).search(/(<h1>|<h2>|<h3>)/i);

                  if (endBlock>-1)
                    partialByName  = partialByName.substr(0, 500 + endBlock)


                //  partialtext = f.text.split(/(<h1>|<h2>|<h3>)/gi).slice(Math.floor(req.query.partial)/2,  Math.floor(req.query.partial)/2+3).join("")


                //let public = (({name})=>({name}))(private);

                  var {_id: id, userid, title, url} = f;


                  User.findOne({_id: req.session.user._id}, (err, u)=>{

                      // console.log(u.socket)

                      io.to(u.socket).emit('doc_partial',
                          {id, userid, title, url, text: partialByName});

                  })








    })
});

//takes optional doc title, create a blank doc and return its object
app.get('/create', auth, function(req, res) {

  //pull title from params or default
  var {title="New File"} = req.query;


  //generate url: if url is already taken, recurse to random chars added
  new Promise(resolve => {

    var uniqueness = (url) => Doc.find({url}, (e,f) => f.length ? uniqueness( url+Math.random().toString(36).slice(2)[0] ) : resolve(url) )
    uniqueness( title.replace(/[\W_]+/g,"").toLowerCase() )

  }).then(url => new Promise(resolve => {

    var utoken = (token=Math.random().toString(36).slice(2).substr(0,4)) => Doc.find({token}, (e,f) => f.length ? utoken() : resolve({url, token}) )
    utoken()

  })).then(({url, token}) =>{

        Doc.create({ url, token, title, text: "", userid: req.session.user._id },
            (e, f) => res.send(f) )

    })



});

//TODO must check last up date of fiel tree in request , to prevent race between tabs
//takes doc id and updated text, title, or shared, performs needed update
app.all('/update',  function(req, res) {
  var userId = req.session.user ? req.session.user._id : false;
  var {id: fileId, text, title, share, shareusers, shareusers_remove_me} = req.body.id ? req.body : req.query;

  Doc.findOne({_id: fileId}, (e, f)=>{
      if (!f) return res.end();
      var isShareUser = f.shareusers.filter(i => i.id==userId).length;

      //update text body -- allowed for owner, share users, and publicedit
      if (text && (f.userid == userId || isShareUser ) ){
        res.end();
        text = require('sanitize-html')(text, {
          allowedTags: ['h1', 'h2', 'h3', 'h4', 'p', 'div', 'br', 'u', 'b', 'i', 'ul', 'li']
          // allowedAttributes: { 'span': ['style'] },
        });
        Doc.update({_id: fileId}, {text, date_updated: Date.now() }).exec(function(e,f){

        }   );
      }


      //update doc title -- allowed for owner
      if (title && f.userid == userId){

          new Promise(resolve => { //uniqueness url check, except if it's this file's url
            var uniqueness = (url) => Doc.find({url}, (e,f) =>
              !f.length || (f.length && f[0]._id == fileId) ? resolve(url) : uniqueness( url+Math.random().toString(36).slice(2)[0] )  )
            uniqueness( title.replace(/[\W_]+/g,"").toLowerCase() )

          }).then(url => {
                Doc.update({_id: fileId}, {title, url, date_updated: Date.now() }).exec(()=> res.send(url) );
          });


	    }

      //update share level -- allowed for owner
      if (share && f.userid == userId)
          Doc.update({_id: fileId}, {share}).exec();

      //TODO if (share == "team")

      //update share users to remove self -- allowed for current user if shared with
      if (shareusers_remove_me && isShareUser )
          Doc.update({_id: fileId}, {shareusers: f.shareusers.filter(i => i.id!=userId) }).exec();

      //update share users -- allowed for owner
        if (shareusers && f.userid == userId){
            Doc.update({_id: fileId}, {shareusers}).exec();

            for (var i in shareusers)
              User.update (
                  {_id: shareusers[i].id},
                  {$push: {'notifications': {
                    type:'doc_share',
                    fileId,
                    title: f.title,
                    owner: req.session.user.name
                  }}}
              ).exec();

            console.log(req.session.user.email + " shared " + f.title + " with " +  JSON.stringify(shareusers));

              //TODO append file to share user's index if not existing and create an event
              //  User.update({_id: u._id}, {$push: {index: {"id": f._id, "title": f.title, "type": "file"} }},  {safe: true, upsert: true}).exec();
        }





          //does this work with others -- udpate pending
      if (!title)
        return res.end();

    });
});

//TODO shared docs & public
//takes a search string, search all user's docs text content
app.get('/search', auth, function(req, res) {
  //TODO files shared with teams i'm on, public files in users tree and speeches

  var {q} = req.query, userId = req.session.user._id;

  // SEARCH STRING OF WORD/S, SEPARATED BY NON_ALPHANUMERICS, CASE INSENSITIVE, TO SEARCH MATCHING ALL WORDS, IN ANY ORDER,
  // EXCEPT TREAT MATCHING SUBSTRING WORDS "IN QUOTES" IN THAT EXACT ORDER
  q2 = "(?=.*"+q.match(/"([^"]+)"|[\w]+/gi).join(")(?=.*").replace(/\"/g,'')+").+"

  console.log(q2)

  Doc.find({
      $or: [{"userid": userId, "text": {"$regex": q2, "$options": "gi" }},
       {  "share": "specific", "shareusers": { $elemMatch: {"id": userId} }, "text": {"$regex": q2, "$options": "gi" }     }]
  }).sort({'date_updated': 'desc'}).exec( (err, files=[])=>{

        return res.json(files.map(f=>{

            f.text = f.text.replace(/<[^>]*>/gi,'')

            var matchedPosition = f.text.toLowerCase().indexOf(q.match(/(\w+)/gi)[0].toLowerCase());
        //    var matchedString = f.text.substring(f.text.lastIndexOf(" ", matchedPosition-40), matchedPosition)
        //      + "<b>"+q+"</b>" + f.text.substring(matchedPosition+q.length, f.text.indexOf(" ", matchedPosition+q.length + 40) );

            matchedString = f.text.substring(matchedPosition-100, matchedPosition+100)
           return {id: f._id, text: f.title,  matchedString };

        }));
  });

});

//input doc id, delete doc by removing ownership
app.get('/delete', auth, function(req, res){
    Doc.update({_id: req.query.id, userid: req.session.user._id}, {userid: "trash_"+ req.session.user._id }).exec(function(e, f){
      return res.end();

    });

});


app.get('/:fileId', function(req, res) {
    var fileId = req.params.fileId;

    Doc.findOne({_id:fileId},(e,f)=>{
      res.json(f)
    })

})
