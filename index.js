var express = require('express'),
app = express(),
server = require('http').createServer(app),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
session = require('express-session'),
fs = require('fs'),
io = require('socket.io')(server);


//db signin
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/debatedata', {
  server: { poolSize: 1 }
});


//middleware
app.use(cookieParser());
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
app.use(session({
    secret: 'cookie_secret',
    resave: true,
    saveUninitialized: true
}));


//ROUTES*****************

//auth
app.use(require('./server/auth') );

function auth(req, res, next) {
  if (!req.isAuthenticated())
    res.send("Login required");

  return next();
}

app.use('/user', require('./server/user'));
app.use('/doc', auth, require('./server/doc'));
app.use('/round', auth, require('./server/round')(io));
app.use('/', require('./server/misc'));



//static routes
app.use(express.static(__dirname + '/public'));


//errors
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send("<pre>"+(app.get('env') === 'development'? err.message : err.message) +"</pre>");
});

//run server
server.listen(80);
console.log("SERVER STARTED " + (new Date().toLocaleString()));







