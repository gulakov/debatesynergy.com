module.exports = app = require('express').Router(), {Download, Visit} = require('./models');
var request = require('request'),
  fs = require('fs');



//serve homepage for single-page app


app.get(/\/[a-zA-Z0-9]*/, function(req, res, next) {


  //re-login existing user
  if ((req.headers.cookie || "").indexOf("connect.sid") > -1 && !req.session.user)
    return res.redirect('/login')



  //detect if MOBILE
  var ua = req.headers['user-agent'];

  var isMobile = (/mobile/i.test(ua) || /iPhone/.test(ua) || /iPad/.test(ua) ||
    /Android/.test(ua) && (/Android ([0-9\.]+)[\);]/.exec(ua)|[])[1]);



    /*
  if (0)
    req.log(({
      ip, sys, geo
    }) => {
      user = req.session.user && req.session.user.email || "";

      log("Visit: " + ip + " " + sys + " " + user);
      Visit.findOne({
        ip
      }, (err, f) => {
        if (!f)
          Visit.create({
            ip, geo, sys
          });
      });
    })
    */


    // dont load home app for subroutes
  if (req.url.indexOf(".") > 0 || req.url.indexOf("/", 1) > 0)
    return next()


  var indexPath = global.min ? "/public/html/index.min.html" :
               // isMobile ? "/public/html/index.mobile.html" :
                "/public/html/index.html"


  var indexHtml = fs.readFileSync(__dirname.replace("/server", "") + indexPath).toString();





    //try fetching file if passed in
    var fileId = req.url.substr(1);
    var userId = req.session && req.session.user ? req.session.user._id : "";



    // if (fileId.length<2)
      return res.send(indexHtml)


      /*
        global.getdoc(fileId, userId, function(f){


            // if (f=="Not found")
            //     return res.status(404).send("Not found");
            //
            // //to read file, must be owner or share user, or file is public
            // if (f=="Access denied")
            //   return res.status(401).send("Access denied");





              // return res.send(indexHtml)



              if (!f||!f.text) return res.send(indexHtml)




              indexHtml = indexHtml.replace("</body>","").replace("</html>","").replace("</main>","")

              res.writeHead(200, {
                'Content-Type': 'text/html' //,
                // 'Cache-Control': 'public, max-age=31557600'
              });


              res.write(indexHtml)
                                    //TODO  f.url
              res.write('<article class="doc" id="doc-'+f.id+'">')

              var len = f.text.length;

              for (var i = 0; i < len; i += 10000) {

                res.write("<section contenteditable>" + f.text.substr(i, 10000) +
                  "</section>")

                if (i + 10000 > f.text.length)
                  res.end();

              }




        })
        */





  // return fs.createReadStream(__dirname.replace("/server", "") +
  //   indexPath).pipe(res, {
  //   end: true
  // });;
});






//Docx is dead. Long live dhtml: the new debate file standard!

//route forwards /fileId database uid to /index.html
app.get(/qqqqq[a-z0-9]+\.html/, function(req, res) {

  // if (url.startsWith('/html') || url.startsWith('/test'))
  //
  //   return fs.createReadStream(__dirname.replace("/server", "") + "/public" +
  //   url).pipe(res, {
  //   end: true
  // });;

  var fileId = req.url.substr(1).replace(".html", "")


  var userId = req.session && req.session.user ? req.session.user._id : "";

  Doc.findOne({
    "url": fileId
  }, (e, f) => {

    if (!f) return res.end();


    headerText = "<html><article><details><summary>\n" + f.title +
      "\n</summary><pre>" +
      "\nid: " + f._id +
      "\nCreated: " + f.date_created +
      "\nUpdated: " + f.date_updated +
      "\n</pre></details>"

    res.writeHead(200, {'Content-Type': 'text/html'});


    res.write(headerText)

    var len = f.text.length;

    for (var i = 0; i < len; i += 10000) {

      res.write("<section contenteditable>" + f.text.substr(i, 10000) +
        "</section>")

      if (i + 10000 > f.text.length)
        res.end();

    }


  })



  // fs.createReadStream("public/index.html").pipe(res, {end: true});;

  //config.cache ? 1000 * 3600 * 24 : 0
});
