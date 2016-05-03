var app = require('express').Router(), model = require('./models');
var request = require('request');
var Download = model.Download, Visit = model.Visit;
module.exports = app;

//log unique visitors exclude bots
app.use(function(req,res,next){
  try {


  req.log = function(callback){

    var ip = req.connection.remoteAddress.toString(), ua = req.headers['user-agent'] || "",
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
  if ( (req.headers.cookie||"").indexOf("autologin")>-1 && !req.session.user)
    return res.redirect('/login')

  //proceed to loading index.html
  next();

  req.log(({ip,sys,geo})=>{
    console.log("Visit: " + geo  + " " + sys + " "
      + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());

    Visit.findOne({ip}, (err, f) => {
        if (!f)
            Visit.create({ ip, geo, sys});
    });
  })


});


//log msword-sidebar unique downloads exclude bots
app.get('/download', function(req, res) {

  req.log(({ip,sys,geo})=>{
      console.log("New Download: " + geo  + " " + sys + " "
        + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());

      Download.create({ ip,sys,geo});
  })

});
