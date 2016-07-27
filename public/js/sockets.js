
/******* WEBSOCKETS *******/

function initSockets(){

// if (typeof(io)=="undefined") return

window.socket = socket = io({ transports: ["websocket"] });

socket.on('error', function(e) {
    console.log(e);
})
.on('connect', function() {


  socket.on('round_newTextForEnemy', function(r) {

    $("#" + r.speechName).html(r.speechPartial);

  });


  socket.on('round_newTextForPartner', function(round) {


    $("#speech1AC").html(round.speech1AC);
    $("#speech1NC").html(round.speech1NC);
    $("#speech2AC").html(round.speech2AC);
    $("#speech2NC").html(round.speech2NC);
    $("#speech1NR").html(round.speech1NR);
    $("#speech1AR").html(round.speech1AR);
    $("#speech2NR").html(round.speech2NR);
    $("#speech2AR").html(round.speech2AR);


  });

  socket.on('round_youAreInvited', function(){
    roundInviteAlert()

  });

  socket.on('round_inviteResponse', function onServerSentEvent(msg) {
    console.log(msg)
    startRound();


  });



  //other sockets


    socket.on('doc_partial', function(docJSON){
      // console.log(docJSON)


  // if (docJSON.text.length < 300) return


    partial  = $("<div class='doc ' contenteditable>"+docJSON.text+"</div>")

    // partial .css("position", "absolute").css("top","0").css("left","300px")
    partial.css("background","white")

    partial.appendTo("#docs")
    partial.find("h1,h2,h3")[0].scrollIntoView()






    });


  })



  $(window).on('beforeunload', function() {
      if (socket)
        socket.close();
  });

}

//INIT
initSockets();
