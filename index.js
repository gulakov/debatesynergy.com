var express = require('express'), app = express(),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
session = require('express-session'),
mongoose = require('mongoose'),
server = require('http').createServer(app).listen(80, function(){
	console.log("SERVER STARTED " + (new Date().toLocaleString()));
}),
io = require('socket.io')(server);

//database
mongoose.connect('mongodb://localhost/debatedata', {server: { poolSize: 5 }});

//middleware
app.use(cookieParser());
app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));
app.use(session({
    secret: 'cookie_secret',
    resave: true,
    saveUninitialized: true
}));

//auth
app.use(require('./server/auth'));
function auth(req, res, next) {
  if (!req.isAuthenticated())
    return res.send("Login required");
  return next();
}

//routes
app.use('/user', require('./server/user'));
app.use('/doc', auth, require('./server/doc'));
app.use('/round', auth, require('./server/round')(io));
app.use('/', require('./server/misc'));

//static routes
app.use(express.static(__dirname + '/public'));
