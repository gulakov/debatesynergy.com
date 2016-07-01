
function initRoundActions(){


    ///creae headings index
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


    //DRAG from editor into speech

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


    $('.speech-nav').bind('dragover', false)
    .bind('drop', function(e) {

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




}//end round actions



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
