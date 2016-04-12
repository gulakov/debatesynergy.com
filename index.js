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
app.use(bodyParser.json({limit: '50mb', parameterLimit: 10000, defer: true}));
app.use(bodyParser.urlencoded({limit: '50mb', extended: true, parameterLimit: 10000, defer: true}));
app.use(session({secret: 'session', resave: true, saveUninitialized: true }));

//routes




var mongo_express = require('mongo-express/lib/middleware')
var mongo_express_config = require('mongo-express/config.default')



app.get('*', function(req, res, next){ 
  if(req.headers.host.indexOf("beta")==0 &&  req.url.length < 3)  
    req.url = '/beta' + req.url;  //append some text yourself
  next(); 
}); 


app.use('/beta', mongo_express(mongo_express_config))




app.use(require('./server/auth'));
app.use('/user', require('./server/user'));
app.use('/doc', require('./server/doc'));
app.use('/team', require('./server/team'));
app.use('/round', require('./server/round')(io));
app.use('/', require('./server/misc'));

app.use(express.static(__dirname + '/public'));

app.use(function(err, req, res, next){
  if(err.status == 400)
    return res.send('Request Aborted');
});