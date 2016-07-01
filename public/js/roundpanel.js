var r = {}

$(document).ready(initRoundPanel);
function initRoundPanel(){



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




  //   ROUND CONTROL ******************


  $('.speech-nav').click(function(e) {

    var speechId = $(this).attr('id').replace("-nav","")

    $('.active-speech').removeClass('active-speech')
    $("#"+speechId).addClass('active-speech')


    $('.active-nav').removeClass('active-nav')
    $(this).addClass('active-nav')


    $('.speech:not(.active-speech)').hide();
    $('.active-speech').show();


    if ( $("#sidebyside").hasClass("active") && $(".active-nav").index() > 1){

      var prevSpeech =  $(".active-speech").prev(".speech");

      if ($(".active-speech").attr('id')=="speech1NR")
        prevSpeech = prevSpeech.prev();

      prevSpeech.show()


    }


  })


  $("#sidebyside").click(function() {
    $(this).toggleClass('active')
    $('.active-nav').click();
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



  //TURN ON FLOW MODE for speech

    $("#speech-flow-mode").click(function(){

      $(".active-speech").toggleClass("flow-mode")

      $(".speech").attr("contenteditable","true");

      $(".flow-mode").attr("contenteditable","false");


      $(".active-nav i").remove()

      if ($(".active-nav").hasClass("scroll")){

        $(".active-nav").removeClass("scroll").prepend('<i class="fa fa-fw fa-pencil"></i>')

      } else {

        $(".active-nav").addClass("scroll").prepend('<i class="fa fa-fw fa-cloud-download"></i>')


      }


      $(".active-speech").scrollTop(
        $(".active-speech").scrollTop() + Math.floor($(".active-speech").height() * .99));

      $(".active-speech").trigger("scroll");


    })





  //FULLSREEN

  $('#fullscreen').click(function() {


      $('#round').css("max-width", "100%");
      $('#sidebar, #docs').hide();



  })

  //PUBLISH SCROll

  $('#speechscroll').click(function() {

    $(".active-nav i").remove()

    if ($(".active-nav").hasClass("scroll")){

      $(".active-nav").removeClass("scroll").prepend('<i class="fa fa-fw fa-eye-slash"></i>')

    } else {

      $(".active-nav").addClass("scroll").prepend('<i class="fa fa-fw fa-eye"></i>')


    }


    $(".active-speech").scrollTop(
      $(".active-speech").scrollTop() + Math.floor($(".active-speech").height() * .99));

    $(".active-speech").trigger("scroll");


  })


};



// open round panel

function openRoundPanel() {

  $("#round").show();

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
