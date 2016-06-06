// Imagination is not the limit of consciousness, instead it is the whole of consciousness as it realizes its freedom. -Sartre

var express = require('express'), app = express(),
subdomain = require('express-subdomain'),
bodyParser = require('body-parser'),
config = require('./config'),
fs = require('fs');

//access config.json globally
for(var key in config)
  global[key]=config[key];

//log
global.log = global.o = function(msg){
    console.log('\033[33m'+new Date().toLocaleString()+'\033[0m', msg);
};

//redirect http to https
require('http').createServer(force_https ? function (req, res) {
  var host = req.headers.host, domain = host.match(/[^\.]*\.[^.]*$/)[0], sub = host.replace(domain,"").replace(/\./g,"");
  res.writeHead(301, {"Location": "https://" + domain + "/"+ sub.replace("www","") +req.url.substring(1)});
  res.end();
} : app).listen(80);


//https certificates
var server = require('https').createServer({
    SNICallback: function(hostname, callback) {
      if (!fs.existsSync('../letsencrypt/live/'+hostname))
        hostname = "debatesynergy.com"

      callback(null, require('tls').createSecureContext({
        cert: fs.readFileSync('../letsencrypt/live/'+hostname+'/fullchain.pem'),
          key: fs.readFileSync('../letsencrypt/live/'+hostname+'/privkey.pem')
      }))
    }},app).listen(443, function(){
  log("SERVER STARTED");
});


//this does not cause memory leaks, personally confirmed with socket.io inventor @rauchg
global.io = io = require('socket.io')(server);
global.io.set('transports', ['websocket']);



//database
global.mongoose = mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/debatedata', {
  server: { poolSize: 10 },
  user: db.user,
  pass: db.password
});


//request parser
app.use(bodyParser.json({limit: '10mb', parameterLimit: 10000, defer: true}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true, parameterLimit: 10000, defer: true}));


//forum

var subRouter2 = express.Router();
subRouter2.use('/', function(req, res) {
  log(req.headers);


proxy.on('proxyReq', function(proxyReq, req, res, options) {
  proxyReq.setHeader(    'x-csrf-token', req.headers['x-csrf-token'] || "");
});

proxy.web(req, res, {
    enable : { xforward: true },
    target: 'http://localhost:4567',
    secure: true,
    headers:{
      'x-csrf-token': req.headers['x-csrf-token'] || ""
    },
    ssl: {
     key: fs.readFileSync('../letsencrypt/live/'+'forum.debatesynergy.com'+'/privkey.pem', 'utf8'),
     cert: fs.readFileSync('../letsencrypt/live/'+'forum.debatesynergy.com'+'/fullchain.pem', 'utf8')
   }
});
})
app.use(subdomain('forum', subRouter2));



//admin db with mongo-express
var subRouter = express.Router();
subRouter.use('/',  require('mongo-express/lib/middleware')(require('./config.mongo')))
app.use(subdomain('admin', subRouter));



var subRouter = express.Router();
subRouter.use('/', function(req,res,n){
  res.send("alert()")
})
app.use(subdomain('read', subRouter));


var httpProxy = require('http-proxy');

var proxy = httpProxy.createProxyServer({});


//user session stored in mongodb
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
app.use(session({secret: cookie, resave: false, saveUninitialized: false,
  cookie: { secure: true, maxAge: new Date(Date.now() + 2592000000) },
  expires: new Date(Date.now() + 2592000000),
  store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// gzip download speed
app.use(require('compression')())

//allow external sites to scrape
app.use(function(req, res, next) {

      app.set('x-powered-by', false);
      app.set('etag', false);
    app.disable("x-powered-by");

    res.removeHeader("ETag");

    app.disable("etag");
    res.setHeader('Access-Control-Allow-Origin', '*')

  next();
});

//require login
global.auth = function (req, res, next) {
  if (!req.session.user)
    return res.send("Login required");
  return next();
}

//Google API
app.use(require('./server/google'));
//testing dev
app.use(require('./server/TEST'));

//server routes
app.use('/user', require('./server/user'));
app.use('/doc', require('./server/doc'));
// app.use('/team', require('./server/team'));
app.use('/round', require('./server/round'));
app.use('/', require('./server/home'));


//frontend files
app.use(require('serve-static')(__dirname + '/public', {  maxAge: config.cache ? 1000 * 3600 * 24 : 0  }))


app.use(function (err, req, res, next) {
  console.log(err.stack)
  req.destroy()
})
