// Proudly sponsored by Total Business Synergy, Inc., distributed under the TotalBS 2.0 License

window.docShareAlert = function(msg) {

  $("#info").append('<div class="alert alert-success alert-dismissable">' +
      '<button  class="close" data-dismiss="alert">&times;</button>' +
      msg.owner + ' has shared \"' + msg.title + '\" with you. <button data-dismiss="alert" class="btn btn-xs btn-primary">Accept</button></div>')
      .on('close.bs.alert', '.alert', function () {
          $.get('/user/notify', {fileId:msg.fileId})

      })
      .on('click', ".btn-primary", function() {
        ft.click(msg.fileId )
        window.location.pathname="/"+msg.fileId;
      })


}

window.alert = function(message, alertclass, container, autofade) {
  var alert = $('<div class="alert-' + (alertclass || "info") + '">' +
    (autofade ? '' : '<span class="close"></span>') + (message || "") + '</div>');

  container = container || '#sidebar';
  //$(container).css("position", "relative");
  $($(container + ">.alert-position")[0] ||
    $("<div class='alert-position'>").prependTo(container)).prepend(alert);

  if (autofade)
    alert.hide().fadeIn(300).delay(1500).closeAlert()
  else
    alert.find('.close').click(function() {
      $(this).parent().closeAlert()
    })
	return alert;
}
jQuery.fn.closeAlert = function() {
  this.animate({
    "opacity": 0,
    "margin-top": "-50px",
    "display": "none"
  }, "fast").delay(300, function() {
    this.remove()
  });
}






	window.roundInviteAlert=	function (msg) {

		    alert('You have been invited into a round with ' + msg.people +
		    '. <button data-dismiss="alert" class="btn btn-xs btn-primary">Accept</button>', 'success')
		    .find(".btn-primary").click(function() {

		      r = {
		        _id: msg.roundId
		      };

		      $.get("/round/accept", {
		        roundId: msg.roundId
		      }, startRound);

		    })

		}



$(document).ready(function() {



  //modal closing

  setTimeout(function(){

      $(".modal").css("left", ($("#sidebar").width()+35) +"px")

      $(".modal").each(function(){
        $(this).prepend('<span class="close">');
      })

      $(".modal-overlay, .close").click(function (e) {
          $(".modal").hide();
      })

  }, 4000)

})//end doc ready
