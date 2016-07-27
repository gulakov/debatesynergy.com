module.exports = app = require('express').Router(), {User, Round} = require('./models');
var request = require('request');

//init socket.io and save socket id to user db
io.on('connection', function (socket) {

  var sessionID = socket.request.headers.cookie;
  if (!sessionID)
    return;

  sessionID = sessionID.substr(sessionID.search('connect.sid=s%3A')+16);
  sessionID = sessionID.substr(0, sessionID.indexOf("."));

  mongoose.connection.db.command({find: "sessions", "filter": {"_id":sessionID} }, function(e,f){
    if (!f.cursor.firstBatch.length) return;
    var session = JSON.parse(f.cursor.firstBatch[0].session)

    User.update({  _id: session.user._id  }, {  socket: socket.id }).exec();

  })


  socket.on('test', function ({fileId}) {
    // console.log(fileId);

    model.Doc.findOne( {"url": fileId }, (e, f)=>{

      socket.emit('show_file', f);

    })


  });


});
