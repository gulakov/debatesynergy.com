module.exports = app = require('express').Router(), {User,Doc} = require('./models');
var request = require('request');


app.all('/t', function(req, res) {



  var  stream = Doc.synchronize()
    , count = 0;

  stream.on('data', function(err, doc){
    count++;
  });
  stream.on('close', function(){
    console.log('indexed ' + count + ' documents!');
  });
  stream.on('error', function(err){
    console.log(err);
  });

  //
//   Doc.search ({
//   query_string: { title: "ggg" }
// }, { hydrate:true }, function(err,results) {
//     res.send(results)
//       o(err)
//   })
//  res.send(req.session.access_token)
  // o(req)
//  res.end();
})

app.get('/drivelist', function(req, res) {

  req.google({url:"drive/v2/files", qs: {
    q: "mimeType contains 'document'"
  }}, googleFiles => {

      res.send(googleFiles)
  })

});


app.use("/contact", function (req, res, next) {
  /*

  new Promise(resolve => {

    var uniqueness = (url) => Doc.find({url}, (e,f) => f.length ? uniqueness( url+Math.random().toString(36).slice(2)[0] ) : resolve(url) )
    uniqueness( title.replace(/[\W_]+/g,"").toLowerCase() )

  }).then(url =>
      Doc.create({ url, title, text: "", userid: req.session.user._id },
          (e, f) => res.send(f) )

  );



                      Doc.create({
                        userid: newAppUser._id,
                        title: "First File",
                        text: "Welcome to your first file, " + newAppUser.name + "!"
                      }, function(err, firstDoc){


                      });

*/

})



app.use("/test2", function (req, res, next) {

  console.log(req.session.user)
  return res.send()

/*
  req.google({
    url: 'https://www.google.com/m8/feeds/contacts/default/full',
    qs: {
      alt: "json",
      v: "3.0",
      q: req.query.q
    }
    }, body=>{

      return res.send(body)

      var contacts = body.feed.entry.map(function(i){
        return  i["gd$email"]  && {name:  i["gd$name"] ? i["gd$name"]["gd$fullName"]["$t"] : "", email: i["gd$email"][0].address }
      })

      res.json(contacts)
  })
*/

})



app.use("/latest", function (req, res, next) {


   Doc.find({ userid: { $not: /55926eec0589b40a0f835c80/} } ).sort({'date_updated': 'desc'}).limit(20).exec(function (err, files) {
        return res.json(files.map(function(f){
        	return f._id + " " + f.text.substring(0,500);
        }));
  });

});
