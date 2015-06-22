var express = require('express');
var app = express.Router();


app.get('/download', function(req, res) {

  var model = require('./models');
  var Download = model.Download;


  var ip = req.connection.remoteAddress.toString();
  var sys = req.headers['user-agent'].match(/\([^)]+\)/gi)[0].replace(/[\(\)]/gi, '');

  var request = require('request');
  request("http://ipinfo.io/" + ip + "/json", function (error, response, body) {


      var r = JSON.parse(body), geo = r.city != null ? r.city + " " + r.country : r.country;

     
      Download.findOne({ip: ip}, function (err, f) {
        console.log("New Download: " + geo + " " + sys);

        if (!f)
            Download.create({ ip: ip, geo: geo, sys: sys}, function(e,f){});

        Download.find({}, function (err, f) {
            return res.end(f.length.toString());
        });


      });


  });

});




module.exports = app;
