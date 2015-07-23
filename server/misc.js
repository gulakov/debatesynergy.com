var app = require('express').Router(), model = require('./models');
var request = require('request');
var Download = model.Download, Visit = model.Visit;
module.exports = app;

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

//log unique visitors exclude bots
app.get('/', function(req, res, next){

  var ip = req.connection.remoteAddress.toString();
  var sys = req.headers['user-agent'] && req.headers['user-agent'].match(/\([^)]+\)/gi) ?
    req.headers['user-agent'].match(/\([^)]+\)/gi)[0].replace(/[\(\)]/gi, '') : req.headers['user-agent'];

  request("http://ipinfo.io/" + ip + "/json", function (error, response, body) {


      var r = JSON.parse(body), geo = r.city != null ? r.city + " " + r.country : r.country;

      //Debate is in the US; non-US IPs will be blocked
      if(r.country!="US" && r.country.length){
	       console.log("Blocked: " + geo);
         return res.send("Debate Synergy is for academic debate community in the US. Your region of " + geo + " is restricted.");
      }

      Visit.findOne({ip: ip}, function (err, f) {

	       if (sys && !sys.match(/(Baidu|Googlebot|bingbot|sigma|compatible;|duckduckgo)/gi)){
           console.log("Visit: " + geo + " " + sys + " " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());

           if (!f)
              Visit.create({ ip: ip, geo: geo, sys: sys});
         }

         return next();

      });


  });



});

app.get('/debatestyle.css', function(req, res){
  res.header('Cache-Control', 'max-age=3600000000000000');
  res.sendFile('public/debatestyle.css', {root: __dirname.replace("/server","")});
});


//route forwards debatesynergy.com/fileId 24-character database uid to home
app.get(/[a-z0-9]{24}/, function(req, res){
  res.sendFile('public/index.html', {root: __dirname.replace("/server","")});
});
