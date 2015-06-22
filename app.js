var express = require('express'),
app = express(),
server = require('http').createServer(app),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
session = require('express-session');
var io = require('socket.io')(server);


//db signin
var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/debatedata', {
  server: { poolSize: 1 }
});


//middleware
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());
app.use(bodyParser.json({limit: '100mb'}));
app.use(bodyParser.urlencoded({limit: '100mb', extended: true}));
app.use(session({
    secret: 'cookie_secret',
    resave: true,
    saveUninitialized: true
}));


/*
var fs = require('fs'), str = 'string to append to file';
fs.open('filepath', 'a', 666, function( e, id ) {
  fs.write( id, 'string to append to file', null, 'utf8', function(){
    fs.close(id, function(){
      console.log('file closed');
    });
  });
});
*/


/******************** ROUTES ********************/

//forever autorefresh
app.get('/refresh', function(){});

//auth
app.use('/', require('./server/auth') );


app.use('/user', require('./server/user'));

//require auth below
app.all('*', function (req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.send("Login required");
  //res.redirect('/auth');
});

app.use('/doc', require('./server/doc'));
app.use('/round', require('./server/round')(io));


//errors
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send("<pre>"+(app.get('env') === 'development'? err.stack : err.message) +"</pre>");
});


//run server
server.listen(80);
console.log("SERVER STARTED " + (new Date().toLocaleString()));







