var app = require('express').Router(), model = require('./models');
var Download = model.Download, Visit = model.Visit;
module.exports = app;

//log msword-sidebar downloads
app.get('/download', function(req, res) {


  var ip = req.connection.remoteAddress.toString();
  var sys = req.headers['user-agent'].match(/\([^)]+\)/gi)[0].replace(/[\(\)]/gi, '');

  var request = require('request');
  request("http://ipinfo.io/" + ip + "/json", function (error, response, body) {


      var r = JSON.parse(body), geo = r.city != null ? r.city + " " + r.country : r.country;


      Download.findOne({ip: ip}, function (err, f) {
        console.log("New Download: " + geo + " " + sys);

        if (!f && !sys.match(/(Baidu|Googlebot|bingbot|sigma|compatible;|duckduckgo)/gi))
            Download.create({ ip: ip, geo: geo, sys: sys}, function(e,f){});

        Download.find({}, function (err, f) {
            return res.end(f.length.toString());
        });


      });


  });

});

//log visitors
app.get('/', function(req, res, next){

  var ip = req.connection.remoteAddress.toString();
  var sys = req.headers['user-agent'].match(/\([^)]+\)/gi)[0].replace(/[\(\)]/gi, '');

  var request = require('request');
  request("http://ipinfo.io/" + ip + "/json", function (error, response, body) {


      var r = JSON.parse(body), geo = r.city != null ? r.city + " " + r.country : r.country;

      Visit.findOne({ip: ip}, function (err, f) {

	       if (!sys.match(/(Baidu|Googlebot|bingbot|sigma|compatible;|duckduckgo)/gi)){
           console.log("Visit: " + geo + " " + sys + " " + new Date().toLocaleString());

           if (!f)
              Visit.create({ ip: ip, geo: geo, sys: sys});
         }

         return next();

      });


  });



});


app.get(/[a-z0-9]{24}/, function(req, res){
  //res.send('hi');

  res.sendFile('public/index.html', { root: __dirname.replace("/server","") });
  //  res.sendfile(__dirname + '/../public/index.html');

});


//forever autorefresh
app.get('/refresh', function(){});
