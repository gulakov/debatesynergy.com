var express = require('express'), app = express(),

bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
session = require('express-session'),
mongoose = require('mongoose'),
subdomain = require('express-subdomain'),
config = require('./config'),
https = require('https'),
http = require('http'),
fs = require('fs');

//require HTTPS
http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers.host + req.url });
    res.end();
}).listen(80);
var server = https.createServer({
  key: fs.readFileSync( process.env.HOME + '/letsencrypt/live/debatesynergy.com/privkey.pem'),
  cert: fs.readFileSync(process.env.HOME + '/letsencrypt/live/debatesynergy.com/fullchain.pem')
}, app).listen(443);

var io = require('socket.io')(server);


//database
mongoose.connect('mongodb://localhost/debatedata', {server: { poolSize: 10 }});


//middleware
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb', parameterLimit: 10000, defer: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 10000, defer: true}));
app.use(session({secret: config.cookie, resave: true, saveUninitialized: true }));
app.use(require('compression')())


//admin
var subRouter = express.Router();
subRouter.use('/',  require('mongo-express/lib/middleware')(require('./config.mongo')))
app.use(subdomain('admin', subRouter));


//routes
app.use('/user', require('./server/user'));
app.use('/doc', require('./server/doc'));
app.use('/team', require('./server/team'));
app.use('/round', require('./server/round')(io));
app.use('/', require('./server/home'));

app.use(require('serve-static')(__dirname + '/public', {  maxAge: config.cache ? 1000 * 3600 * 24 : 0  }))

app.use(function(err, req, res, next){
  if(err.status == 400)
    return res.send('Request Aborted');
});
