var express = require('express'), app = express(),
subdomain = require('express-subdomain'),
bodyParser = require('body-parser'),
config = require('./config'),
https = require('https'),
http = require('http'),
fs = require('fs');



//require https
http.createServer(config.force_https ? function (req, res) {
  var host = req.headers.host, domain = host.match(/[^\.]*\.[^.]*$/)[0], sub = host.replace(domain,"").replace(/\./g,"");

  res.writeHead(301, {"Location": "https://" + domain + "/"+ sub.replace("www","") +req.url.substring(1)});

    res.end();
} : app).listen(80);



//https certificates

//https certificates
var server = https.createServer({
    SNICallback: function(hostname, callback) {
      if (!fs.existsSync('../letsencrypt/live/'+hostname))
        hostname = "debatesynergy.com"

      callback(null, require('tls').createSecureContext({
        cert: fs.readFileSync('../letsencrypt/live/'+hostname+'/fullchain.pem'),
          key: fs.readFileSync('../letsencrypt/live/'+hostname+'/privkey.pem')
      }))
    }}, app).listen(443, function(){
  console.log("SERVER STARTED " + (new Date().toLocaleString()));
});

var io = require('socket.io')(server);


//database
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/debatedata', {
  server: { poolSize: 10 },
  user: config.db.user,
  pass: config.db.password
});


//request parser
app.use(bodyParser.json({limit: '50mb', parameterLimit: 10000, defer: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 10000, defer: true}));


//admin db with mongo-express
var subRouter = express.Router();
subRouter.use('/',  require('mongo-express/lib/middleware')(require('./config.mongo')))
app.use(subdomain('admin', subRouter));




//user session stored in mongodb
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
app.use(session({secret: config.cookie, resave: true, saveUninitialized: false, cookie: {
  secure: true, key: "user",

  maxAge: new Date(Date.now() + 60 * 100000000) //1 minute
},
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 14 * 24 * 60 * 60,

    autoRemove: 'disabled'})
}));

// gzip download speed
app.use(require('compression')())

app.get('*', function (req, res, next) {
    req.session.foobar = Date.now();
    next();
})

//Google API
app.use(require('./server/google'));
//testing dev
app.use(require('./TEST'));

//server routes
app.use('/user', require('./server/user'));
app.use('/doc', require('./server/doc'));
app.use('/team', require('./server/team'));
app.use('/topic', require('./server/topic'));
app.use('/round', require('./server/round')(io));
app.use('/', require('./server/home'));


//frontend files
app.use(require('serve-static')(__dirname + '/public', {  maxAge: config.cache ? 1000 * 3600 * 24 : 0  }))


app.use(function (err, req, res, next) {
  console.log(err.stack)
  req.destroy()
})


//route forwards /fileId database uid to /index.html
app.get(/[a-z0-9]+\.html$/i, function(req, res){
 	return res.send(req.url);

  res.sendFile('public/index.html', {root: __dirname.replace("/server",""), maxAge: config.cache ? 1000 * 3600 * 24 : 0 });
});


//route forwards /fileId database uid to /index.html
app.get(/[a-zA-Z0-9]+/, function(req, res){
  //re-login existing user
  if (req.headers.cookie && req.headers.cookie.indexOf("autologin")>-1 && !req.session.user)
    return res.redirect('/login')

  res.sendFile('public/index.html', {root: __dirname.replace("/server",""), maxAge: config.cache ? 1000 * 3600 * 24 : 0 });
});
