module.exports = app = require('express').Router(), {Download, Visit} = require('./models');
var request = require('request'), fs = require('fs');




//Docx is dead. Long live dhtml: the new debate file standard!

//route forwards /fileId database uid to /index.html
app.get(/[a-zA-Z0-9]+\.html/, function(req, res){
  //re-login existing user

    var {url} = req;

    if (url.startsWith('/html'))

        return fs.createReadStream(__dirname.replace("/server","")+"/public"+url).pipe(res, {end: true});;

    fileId = url.substr(1).replace(".html","")


    var userId = req.session && req.session.user ? req.session.user._id : "";

    Doc.findOne({"url":  fileId } , (e, f)=>{

          if (!f) return res.end();


          headerText="<html><article><details><summary>\n"
                  +f.title+
                  "\n</summary><pre>"+
                  "\nid: "+f._id+
                  "\nCreated: "+f.date_created+
                  "\nUpdated: "+f.date_updated+
                  "\n</pre></details>"

             res.writeHead(200, {'Content-Type': 'text/html'});


             res.write(headerText)

             var len = f.text.length;

             for (var i=0;i<len;i+=10000){

                 res.write("<section contenteditable>" + f.text.substr(i,10000) + "</section>")

                  if (i+10000>f.text.length)
                    res.end();

              }


      })




    // fs.createReadStream("public/index.html").pipe(res, {end: true});;

    //config.cache ? 1000 * 3600 * 24 : 0
});






 app.get('google5b99926759301320.html', function(req, res){
 	return res.send("google-site-verification: google5b99926759301320.html");

});

app.get('/favicon.ico', function(req, res){
  fs.createReadStream(__dirname.replace("/server","")+"/public/img/favicon.ico").pipe(res, {end: true});;
})



//log unique visitors exclude bots
app.use(function(req,res,next){
  try {


  req.log = function(callback){

    var ip = req.connection.remoteAddress && req.connection.remoteAddress.toString(), ua = req.headers['user-agent'] || "",
    sys = (ua.match(/\([^)]+\)/gi) || [""])[0].replace(/[\(\)]/gi, '') || ua;

    request("http://ipinfo.io/" + ip + "/json", (error, response, body)=>{

        var {city="",country="US"} = JSON.parse(body) || {};


         if (sys && !(sys.match(/(Baidu|bot|sigma|compatible;|duckduckgo)/gi)||[]).length && country=="US"){

              callback({ ip, sys, geo: city + " " + country })

           }

    });
  }

  } catch(e){

  }

  next();
})

//serve homepage for single-page app
app.get('/', function(req, res, next){

  //re-login existing user
  if ( (req.headers.cookie||"").indexOf("connect.sid")>-1 && !req.session.user)
     return res.redirect('/login')

  //proceed to loading index.html
  next();

  req.log(({ip,sys,geo})=>{
    user = req.session.user.email ||"";

    log("Visit: " + geo  + " " + sys + " " + user);
    Visit.findOne({ip}, (err, f) => {
        if (!f)
            Visit.create({ ip, geo, sys});
    });
  })


});


//log msword-sidebar unique downloads exclude bots
app.get('/download', function(req, res) {

  req.log(({ip,sys,geo})=>{
      log("New Download: " + geo  + " " + sys);

      Download.create({ip,sys,geo});
  })

});
