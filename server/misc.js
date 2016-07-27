module.exports = app = require('express').Router(), {Download, Visit} = require('./models');
var request = require('request'),
  fs = require('fs');


app.get('google5b99926759301320.html', function(req, res) {
  return res.send("google-site-verification: google5b99926759301320.html");

});

app.get('/favicon.ico', function(req, res) {
  fs.createReadStream(__dirname.replace("/server", "") +
    "/public/css/icon/favicon.ico").pipe(res, {
    end: true
  });;
})



//log unique visitors exclude bots
app.use(function(req, res, next) {
  try {


    req.log = function(callback) {

      var ip = req.connection.remoteAddress && req.connection.remoteAddress
        .toString(),
        ua = req.headers['user-agent'] || "",
        sys = (ua.match(/\([^)]+\)/gi) || [""])[0].replace(/[\(\)]/gi, '') ||
        ua;

      // request("http://ipinfo.io/" + ip + "/json", (error, response, body)=>{

      // var {city="",country="US"} = JSON.parse(body) || {};

      //&& country=="US"
      if (sys && !(sys.match(/(Baidu|bot|sigma|compatible;|duckduckgo)/gi) || [])
        .length) {

        callback({
          ip, sys, geo: ""
        })

      }

      // });
    }

  } catch (e) {

  }

  next();
})

//log msword-sidebar unique downloads exclude bots
app.get('/download', function(req, res) {

  req.log(({
    ip, sys, geo
  }) => {
    log("New Download: " + geo + " " + sys);

    Download.create({
      ip, sys, geo
    });
  })

});
