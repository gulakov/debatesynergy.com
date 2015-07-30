var express = require('express'), app = express(),
server = require('http').createServer(app).listen(80, function(){
	console.log("START: " + new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString());
}),
bodyParser = require('body-parser'),
cookieParser = require('cookie-parser'),
session = require('express-session'),
mongoose = require('mongoose'),
io = require('socket.io')(server);

//database
mongoose.connect('mongodb://localhost/debatedata', {server: { poolSize: 5 }});

//middleware
app.use(cookieParser());
app.use(bodyParser.json({limit: '50mb', parameterLimit: 10000, limit: 1024 * 1024 * 10}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 10000, limit: 1024 * 1024 * 10}));
app.use(session({secret: 'session', resave: true, saveUninitialized: true }));

//routes
app.use(require('./server/auth'));
app.use('/user', require('./server/user'));
app.use('/doc', require('./server/doc'));
app.use('/team', require('./server/team'));
app.use('/round', require('./server/round')(io));
app.use('/', require('./server/misc'));

app.use(express.static(__dirname + '/public', {setHeaders: function(res, path, stat){
    res.set('Cache-Control', 'max-age=1000000000000000');
}}));
