var r = {};
var socket;

function initSockets(){


if (typeof(io)!="undefined")
   socket = io()

if (socket)
  socket.on('error', function() {

      console.log("end")
    location.reload(true);

  setTimeout(function() {
    location.reload(true);

  }, 100);
})
.on('connect', function() {

  $.get("/round/join", {
    socket: socket.id
  });



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



  socket.on('round_youAreInvited', function(msg) {
    console.log(msg)


    $("#info").append('<div class="alert alert-success alert-dismissable">' +
        '<button  class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
        'You have been invited into a round with ' + msg.people + '. <button data-dismiss="alert" class="btn btn-xs btn-primary">Accept</button></div>')
      .find(".btn-primary").click(function() {

        r = {
          _id: msg.roundId
        };

        $.get("/round/accept", {
          roundId: msg.roundId
        }, startRound);

      })

  });



  socket.on('round_inviteResponse', function onServerSentEvent(msg) {
    console.log(msg)
    startRound();


  });




})


$(window).on('beforeunload', function() {
  if (socket)
    socket.close();
});

}


$(document).ready(function() {

  //init sockets for rounds
  initSockets();

  //autofill usernames

  $("#judges, #aff1, #aff2, #neg1, #neg2").select2({
    ajax: {
      url: "/user/search",
      dataType: 'json',
      delay: 50,
      data: function (params) {
      return {userinfo: params.term};
      },
      processResults: function (data, params) {
        return {results: data.splice(0, u.name ? 5 : 0)}; //Login required to invite users
      },
      cache: true
      },
      minimumInputLength: 2,
      escapeMarkup: function (markup) { return markup; },

      maximumSelectionLength: 9,
      templateResult: function  (sel) {
        return sel.email ? u.name ? "<span><b>" +sel.text + "</b> " + sel.email + "</span>" : "Login required" : sel.text;
      }
      //data: finalList,

  })






  //ROUND CONTROL
  $('a[data-toggle="pill"]').on('shown.bs.tab', function(e) {

    $(".speech").css("width", "100%").css("float", "inherit")

    $(".speech:not(.active)").hide();

    $(".speech.active ").show();

  })


  $("#sidebyside").click(function() {
    if ($(".speech.active").attr("id") == "speech1AC")
      return;


    if ($(".speech.active").css("float") != "left") {

      $(".speech").css("width", "100%").css("float", "inherit")
        .hide();

      $(".speech.active")
        .css("width", "50%").css("float", "left")
        .show();

      $(".speech.active").prev(".speech")
        .css("width", "50%").css("float", "left").css("visibility", "visible")
        .show();

    } else {


      $(".speech").css("width", "100%").css("float", "inherit")

      $(".speech:not(.active)").hide();

      $(".speech.active ").show();


    }


  })


  $("#roundcreate").click(function() {
    $("#aff1, #aff2, #neg1, #neg2, #judges").removeClass("btn-danger");


    if ($("#roundcreate").text() == "Invite") {


      $.getJSON('/round/create', {
        aff1: $("#aff1").val(),
        aff2: $("#aff2").val(),
        neg1: $("#neg1").val(),
        neg2: $("#neg2").val(),
        judges: $("#judges").val()

      }, function(r) {


        $("#aff1, #aff2, #neg1, #neg2, #judges").removeClass("btn-danger");

        for (var i in r)
          $("#" + r[i]).addClass("btn-danger");


      });


    } else {

      $.get('round/resend', {
        roundId: r._id
      });


    }

  });

  $(".speech").on("scroll", function() {

    if ($(this).attr("contenteditable") == "false" || !$("li.active a").hasClass("btn btn-info"))
      return;

    console.log($(this).attr("contenteditable"));

    var scrollToPrior = $(this).attr("scroll") || 0;

    var y = $(this).offset().top + $(this).height() - 20;
    var x = $(this).offset().left + 50;

    var e = $(document.elementFromPoint(x, y));

    e = e.next() != null ? e.next() : e;

    console.log(e);

    var scrollTo = $(this).html().replace(/[\r\n]/gi, '')
      .indexOf(e.html().replace(/[\r\n]/gi, ''), scrollToPrior - 20);


    //var scrollTo = $(this).find("*")          .index( e );

    console.log(scrollTo);

    if (scrollTo < scrollToPrior)
      scrollTo = scrollToPrior;


    $(this).attr("scroll", scrollTo);


    $.get('round/updateScroll', {
      roundId: r._id,
      speechName: $(this).attr("id"),
      scrollTo: scrollTo
    });


  });

  // allow only "flowing input" for enemy's speeches
  $(".speech").on("mousedown click", function() {


    if (r.aff1 == u.email || r.aff2 == u.email)
      r.mySide = "aff";
    else if (r.neg1 == u.email || r.neg2 == u.email)
      r.mySide = "neg";

    var isSpeechAff = $(this).index()%2;

    //if you're in your own speech or no side declared -- exit inserting flow
    if ( (!r.mySide) || (r.mySide == "aff" && isSpeechAff) || (r.mySide == "neg" && !isSpeechAff) )
      return;



    var el = $("<p>").addClass("flow").html("&nbsp;");

    var p = $(window.getSelection().anchorNode).closest('p');

    if (p.prev().hasClass("flow"))
      el = p.prev();
    else
      p.before(el)


    var range = document.createRange();
    range.setStart(el[0], 0);
    range.setEnd(el[0], 1);
    sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);


  })





  $(".speech").on("input", function() {

    var index = $(this).find("#index").length ?
      $(this).find("#index") :
      $("<div>").attr("id", "index").css("margin-top", "-20px").css("position", "absolute").prependTo($(".speech.active"));


    var headings = $(this).find("h1");
    index.empty();
    for (var i = 0; i < headings.length; i++) {
      var h = headings[i];
      if (h.textContent.length > 2)
        index.append($("<a>")
          .attr("onClick", '$(this).parent().parent().find("h1")[' + i + '].scrollIntoView();')
          .html(h.textContent)
        ).append(" &bull; ");
    }
    index.contents().last().remove();


    $.post('round/update', {
      roundId: r._id,
      speech1AC: $("#speech1AC").html(),
      speech1NC: $("#speech1NC").html(),
      speech2AC: $("#speech2AC").html(),
      speech2NC: $("#speech2NC").html(),
      speech1NR: $("#speech1NR").html(),
      speech1AR: $("#speech1AR").html(),
      speech2NR: $("#speech2NR").html(),
      speech2AR: $("#speech2AR").html()
    });


  });


  //drag from editor into speech

  $('#docs').on('dragstart', function(e) {

    var range = window.getSelection().getRangeAt(0);
    var dragCopy = $("#drag-copy");
    dragCopy.hide();

    var selectionContents = range.cloneContents();
    dragCopy.empty();
    dragCopy.append(selectionContents);


    e.originalEvent.dataTransfer.effectAllowed = 'copy';


    $('#round .tab-pane').bind('dragover', false);

  });

  $('#docs').bind('dragend', function(e) {
    //alert(1)
    $("#drag-copy").empty();
  })


  $('#speech-tabs a').bind('dragover', false);

  $('#speech-tabs a').bind('drop', function(e) {

    if ($("#" + e.target.href.replace(/.+\#/gi, "")).attr('contenteditable') == 'false')
      return;

    if ($("#drag-copy").html().length == 0)
      return;

    e.preventDefault();
    e.stopPropagation();


    $("#" + e.target.href.replace(/.+\#/gi, "")).append($("#drag-copy").html());

      $("#drag-copy").empty();
  });


  $('.speech').bind('drop', function(e) {

    if ($(this).attr('contenteditable') == 'false')
      return;

      if ($("#drag-copy").html().length == 0)
        return;

    e.preventDefault();
    e.stopPropagation();

    $(e.target).append($("#drag-copy").html());

      $("#drag-copy").empty();


    $('#round .tab-pane').unbind('dragover');

    return false;

  })


  $('#speech-tabs a').click(function(e) {
    e.preventDefault()
    $(this).tab('show')
  });


  $('#fullscreen').click(function() {

    if ($('#sidebar').is(":visible")) {

      $('#round').css("width", "100%");
      $('#sidebar, #docs').hide();

    } else {

      $('#round').css("width", "40%");
      $('#sidebar, #docs').show();

    }

  })

  $('#speechscroll').click(function() {

    $("li.active a").addClass("btn btn-info");


    $(".speech.active").scrollTop(
      $(".speech.active").scrollTop() + Math.floor($(".speech.active").height() * .99));

    $(".speech.active").trigger("scroll");


  })






});


function round_init() {
  $.getJSON("/round", function(resp) {

    $("#pastrounds").empty();

    if (resp.length)
      $("#pastrounds").addClass("well")

    for (var i in resp) {

      var roundDiv = $("<div>");
      roundDiv.attr('id', resp[i]._id);

      roundDiv.html("<a class='label label-default'>" + (new Date(resp[i].date_created)).toLocaleDateString() + "</a> " +
        resp[i].aff1.name + " " + resp[i].aff2.name + " <strong>vs</strong> " +
        resp[i].neg1.name + " " + resp[i].neg2.name  + " <strong>judged by</strong> " +
        resp[i].judges.map(function(i) { return i.name; }).join(", ") );


      roundDiv.click(function() {

        r._id = $(this).attr('id');

        startRound();
      })

      $("#pastrounds").append(roundDiv);

    }


  });
}


function startRound() {

  if (!$("#round").is(":visible")) {

    $("#showround").click();
  }

  $.getJSON("/round/read", {
    id: r._id
  }, function(roundJSON) {
    //set global

    r = roundJSON;
    //#AACFE7

    $("#speech1AC").html(r.speech1AC.text);
    $("#speech1NC").html(r.speech1NC.text);
    $("#speech2AC").html(r.speech2AC.text);
    $("#speech2NC").html(r.speech2NC.text);

    $("#speech1NR").html(r.speech1NR.text);
    $("#speech1AR").html(r.speech1AR.text);
    $("#speech2NR").html(r.speech2NR.text);
    $("#speech2AR").html(r.speech2AR.text);

    /*$("#speech-tabs a").removeClass("btn-info");



    if (r.scroll_1AC) $("li a[href=#speech1AC]").addClass("btn btn-info");
    if (r.scroll_1NC) $("li a[href=#speech1NC]").addClass("btn btn-info");
    if (r.scroll_2AC) $("li a[href=#speech2AC]").addClass("btn btn-info");
    if (r.scroll_2NC) $("li a[href=#speech2NC]").addClass("btn btn-info");
    if (r.scroll_1NR) $("li a[href=#speech1NR]").addClass("btn btn-info");
    if (r.scroll_1AR) $("li a[href=#speech1AR]").addClass("btn btn-info");
    if (r.scroll_2NR) $("li a[href=#speech2NR]").addClass("btn btn-info");
    if (r.scroll_2AR) $("li a[href=#speech2AR]").addClass("btn btn-info");*/



    $('.username-select').empty()

    $("#aff1").append("<option value='"+r.aff1.id+"'selected>"+r.aff1.name+"</option>");
    $("#aff2").append("<option value='"+r.aff2.id+"'selected>"+r.aff2.name+"</option>");
    $("#neg1").append("<option value='"+r.neg1.id+"'selected>"+r.neg1.name+"</option>");
    $("#neg2").append("<option value='"+r.neg2.id+"'selected>"+r.neg2.name+"</option>");

    for (var i in r.judges)
      $('#judges').append("<option value='"+r.judges[i].id+"' selected>"+r.judges[i].name+"</option>");

    $('.username-select').trigger('change');

    for (var i in r.judges)
      if (r.judges[i].status)
        $("#judges+span .select2-selection__choice").eq(i).css("background-color", "rgb(170, 207, 231)")

    if (!r.judges.find(function(i){ return !i.status } ))
      $("#judges").removeClass("btn-info").attr("disabled", true);
    else
      $("#judges").addClass("btn-info");

    if (!r.aff1.status)
      $("#aff1").addClass("btn-info");
    else
      $("#aff1").removeClass("btn-info").attr("disabled", true);

    if (!r.aff2.status)
      $("#aff2").addClass("btn-info");
    else
      $("#aff2").removeClass("btn-info").attr("disabled", true);

    if (!r.neg1.status)
      $("#neg1").addClass("btn-info");
    else
      $("#neg1").removeClass("btn-info").attr("disabled", true);

    if (!r.neg2.status)
      $("#neg2").addClass("btn-info");
    else
      $("#neg2").removeClass("btn-info").attr("disabled", true);



    //block opp side input
    // $(".speech").attr("contenteditable", false);

    if (r.aff1.id == u.id || r.aff2.id == u.email.id)
      r.mySide = "aff";
    else if (r.neg1 == u.email || r.neg2 == u.email)
      r.mySide = "neg";

    $("#speech1AC, #speech2AC, #speech1AR, #speech2AR").addClass("aff");
    $("#speech1NC, #speech2NC, #speech1NR, #speech2NR").addClass("neg");


    $("#roundcreate").text("Resend");

    /*
    if (r.status_aff1 && r.status_aff2 && r.status_neg1 && r.status_neg2 && r.status_judges)
      $("#roundcreate").hide();
    else
      $("#roundcreate").show();
      */


  })


}
