var app = require('express').Router(), model = require('./models');
var request = require('request');
var Download = model.Download, Visit = model.Visit;
module.exports = app;


//serve homepage for single-page app
app.get('/', function(req, res, next){
  
  //re-login existing user
  if (req.cookies.autologin && !req.session.user)
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


//route forwards debatesynergy.com/fileId 24-character database uid to home
app.get(/[a-z0-9]{24}/, function(req, res){
  //re-login existing user
  if (req.cookies.autologin && !req.session.user)
    return res.redirect('/user/login')

  res.sendFile('public/index.html', {root: __dirname.replace("/server","")});
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
