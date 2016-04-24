var app = require('express').Router(), model = require('./models');
var request = require('request');
var Download = model.Download, Visit = model.Visit;
module.exports = app;


//serve homepage for single-page app
app.get('/', function(req, res, next){

  //re-login existing user
  if (req.headers.cookie && req.headers.cookie.indexOf("autologin")>-1 && !req.session.user)
    return res.redirect('/user/login')

  //log unique visitors exclude bots
  var ip = req.connection.remoteAddress.toString();
  var sys = req.headers['user-agent'] && req.headers['user-agent'].match(/\([^)]+\)/gi) ?
    req.headers['user-agent'].match(/\([^)]+\)/gi)[0].replace(/[\(\)]/gi, '') : req.headers['user-agent'];

  request("http://ipinfo.io/" + ip + "/json", function (error, response, body) {


      var r = JSON.parse(body), geo = r.city != null ? r.city + " " + r.country : r.country;

      //keep getting random foreign crawlers, so non-US IPs will be blocked
      if(r.country!="US" && r.country.length){
	         return res.status(404).end();
       }

      Visit.findOne({ip: ip}, function (err, f) {

	       if (sys && !sys.match(/(Baidu|Googlebot|bingbot|sigma|NerdyBot|compatible;|duckduckgo)/gi)){
           console.log("Visit: " + geo + " " + sys + " " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());

           if (!f)
              Visit.create({ ip: ip, geo: geo, sys: sys});
         }

      });

  });

  return next();

});


//log msword-sidebar unqiue downloads exclude bots
app.get('/download', function(req, res) {


  var ip = req.connection.remoteAddress.toString();
  var sys = req.headers['user-agent'] && req.headers['user-agent'].match(/\([^)]+\)/gi) ?
    req.headers['user-agent'].match(/\([^)]+\)/gi)[0].replace(/[\(\)]/gi, '') : req.headers['user-agent'];


  request("http://ipinfo.io/" + ip + "/json", function (error, response, body) {


      var r = JSON.parse(body), geo = r.city != null ? r.city + " " + r.country : r.country;


      Download.findOne({ip: ip}, function (err, f) {
        console.log("New Download: " + geo + " " + sys + " " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());

        if (!f && !sys.match(/(Baidu|Googlebot|bingbot|sigma|compatible;|duckduckgo)/gi))
            Download.create({ ip: ip, geo: geo, sys: sys}, function(e,f){});

        Download.find({}, function (err, f) {
            return res.end(f.length.toString());
        });


      });


  });

});



app.get('/test', function(req,res){

            var fs = require("fs");
        var JSZip = require("jszip");

          var cheerio = require("cheerio")


        var _rez;

        var docx2html = function(docXML, styleXML){
              var styleDom = cheerio.load(styleXML)

              styleDom = styleDom("styles")
          return res.send(styleDom.html())

        }

        // read a zip file
        fs.readFile("server/try.docx", function(err, rez) {
          if (err) throw err;

           _rez = rez;

           var zip = new JSZip();

            zip.loadAsync(rez).then(function (zip) {
                return zip.file("word/document.xml").async("string");
              }).then(function (doc_raw) {
                
                    var docXML = doc_raw;

//                      console.log(doc_raw)
  //                  return res.send(doc_raw)

        
                    var zip2 = new JSZip();

                    zip2.loadAsync(rez)
                    .then(function(zip2) {
                      return zip2.file("word/styles.xml").async("string");
                    }).then(function (styleXML) {

                      styleXML = styleXML.replace(/<w:/g, '<').replace(/<\/w:/g, '</')

                      docx2html(docXML,styleXML)

//
  //                    console.log(styleDom.html())


                    return res.send("")


/*


                        var DOMParser = require('xmldom').DOMParser;

              

                    var cheerio = require('cheerio');



                           //DOM containing available styles and their properties
                 .replace(/<w:/g, '<').replace(/<\/w:/g, '</')))



                console.log(1)

                //DOM containing document elements and some formatting
                var inputDom = cheerio.load(docXML.replace(/<[a-zA-Z]*?:/g, '<').replace(/<\/[a-zA-Z]*?:/g, '</'))('body').find('rStyle');

                console.log(inputDom)
                */

                  })


          })  



})


})

