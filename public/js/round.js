var r = {};



var socket = io();
socket.on('connect', function(){

   $.get("/round/join", {socket: socket.id});





    socket.on('round_youAreInvited', function (msg) {


        $("#info").append('<div class="alert alert-success alert-dismissable">' +
            '<button  class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
            'You have been invited into a round with ' + msg.people + '. <button data-dismiss="alert" class="btn btn-xs btn-primary">Accept</button></div>')
            .find(".btn-primary").click(function () {
                
                r = {id : msg.roundId};

                $.get("/round/accept", {roundId: msg.roundId}, startRound);

            })

    });



    socket.on('round_inviteResponse', function onServerSentEvent(msg) {
        startRound();


    });




})

    
$(window).on('beforeunload', function(){
    socket.close();
});


$(document).ready(function () {


    



    //ROUND CONTROL
    $('a[data-toggle="pill"]').on('shown.bs.tab', function (e) {

        $(".speech").css("width", "100%").css("float", "inherit")

        $(".speech:not(.active)").hide();

        $(".speech.active ").show();

    })


    $("#sidebyside").click(function () {
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


    $("#roundcreate").click(function () {
        $("#aff1, #aff2, #neg1, #neg2, #judge1").removeClass("btn-danger");


        if ($("#roundcreate").text() == "Invite") {


            $.getJSON('/round/create', {
                aff1: $("#aff1").val(),
                aff2: $("#aff2").val(),
                neg1: $("#neg1").val(),
                neg2: $("#neg2").val(),
                judge1: $("#judge1").val()

            }, function (r) {



                $("#aff1, #aff2, #neg1, #neg2, #judge1").removeClass("btn-danger");

                for (var i in r)
                    $("#" + r[i]).addClass("btn-danger");


            });


        } else {

            $.get('round/resend', {roundId: r._id});


        }

    });

    $(".speech").on("scroll", function () {

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
    $(".speech").on("mousedown", function(){


        if (r.aff1 == u.email || r.aff2 == u.email )
            r.mySide = "aff";
        else if (r.neg1 == u.email || r.neg2 == u.email )
            r.mySide = "neg";


        if ($(this).hasClass(r.mySide) )
            return;



        var sel = window.getSelection();
        var range = sel.getRangeAt(0);
        var el = $("<span>").addClass("flow-text").html(" ")[0];

        range.collapse();
        range.insertNode(el);
        sel.removeAllRanges();
        sel.addRange(range);


    })





    $(".speech").on("input", function () {

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
            speech2AR: $("#speech2AR").html(),
        });


    });


    //drag from editor into speech

    $('#editor').bind('dragstart', function (e) {

        var range = window.getSelection().getRangeAt(0);
        var dragCopy = $("#drag-copy");
        dragCopy.hide();

        var selectionContents = range.cloneContents();
        dragCopy.empty();
        dragCopy.append(selectionContents);


        e.originalEvent.dataTransfer.effectAllowed = 'copy';


        $('#round .tab-pane').bind('dragover', false);

    });

    $('#editor').bind('dragend', function (e) {
        //alert(1)
        $("#drag-copy").empty();
    })


    $('#speech-tabs a').bind('dragover', false);

    $('#speech-tabs a').bind('drop', function (e) {

        if ($("#" + e.target.href.replace(/.+\#/gi, "")).attr('contenteditable') == 'false')
            return;

        if ( $("#drag-copy").html().length == 0 )
            return;

        e.preventDefault();
        e.stopPropagation();


        $("#" + e.target.href.replace(/.+\#/gi, "")).append($("#drag-copy").clone().show());
    });


    $('.speech').bind('drop', function (e) {

        if ($(this).attr('contenteditable') == 'false')
            return;

        e.preventDefault();
        e.stopPropagation();

        $(e.target).append($("#drag-copy").clone().show());


        $('#round .tab-pane').unbind('dragover');

        return false;

    })


    $('#speech-tabs a').click(function (e) {
        e.preventDefault()
        $(this).tab('show')
    });


    $('#fullscreen').click(function () {

        if ($('#sidebar').is(":visible")) {

            $('#round').css("width", "100%");
            $('#sidebar, #editor').hide();

        } else {

            $('#round').css("width", "40%");
            $('#sidebar, #editor').show();

        }

    })

    $('#speechscroll').click(function () {

        $("li.active a").addClass("btn btn-info");


        $(".speech.active").scrollTop(
            $(".speech.active").scrollTop() + Math.floor($(".speech.active").height() * .99));

        $(".speech.active").trigger("scroll");


    })






});


function round_init(){
 $.getJSON("/round", function(resp) {

        $("#pastrounds").empty();

        if (resp.length)
            $("#pastrounds").addClass("well")

        for (var i in resp) {


            var roundDiv = $("<div>");


            var roundLabel = $("<a class='label label-default'>");

            var date = (new Date(resp[i].date_created)).toLocaleDateString();

            roundLabel.html(date);

            var people = " " + resp[i].aff1 + " " + resp[i].aff2 + " <strong>vs</strong> " + resp[i].neg1 + " " + resp[i].neg2;
            people = people.replace(/\@[^ ]+/gi, '');
            roundDiv.html(people);

            roundLabel.attr('id', resp[i]._id);

            roundLabel.click(function() {


                r._id = $(this).attr('id');


                startRound();

            })


            roundDiv.prepend(roundLabel);

            $("#pastrounds").append(roundDiv);

        }


    });
}


function startRound() {

    if (!$("#speech").is(":visible")) {

        $("#speech").show();
        $("#editor").removeClass("col-xs-10").addClass("col-xs-5");

    }


    $.getJSON("/round/read", {id: r._id}, function (roundJSON) {

        //set global

        r = roundJSON;


        $("#speech1AC").html(r.speech1AC);
        $("#speech1NC").html(r.speech1NC);
        $("#speech2AC").html(r.speech2AC);
        $("#speech2NC").html(r.speech2NC);

        $("#speech1NR").html(r.speech1NR);
        $("#speech1AR").html(r.speech1AR);
        $("#speech2NR").html(r.speech2NR);
        $("#speech2AR").html(r.speech2AR);

        $("#speech-tabs a").removeClass("btn-info");

        if (r.scroll_1AC) $("li a[href=#speech1AC]").addClass("btn btn-info");
        if (r.scroll_1NC) $("li a[href=#speech1NC]").addClass("btn btn-info");
        if (r.scroll_2AC) $("li a[href=#speech2AC]").addClass("btn btn-info");
        if (r.scroll_2NC) $("li a[href=#speech2NC]").addClass("btn btn-info");
        if (r.scroll_1NR) $("li a[href=#speech1NR]").addClass("btn btn-info");
        if (r.scroll_1AR) $("li a[href=#speech1AR]").addClass("btn btn-info");
        if (r.scroll_2NR) $("li a[href=#speech2NR]").addClass("btn btn-info");
        if (r.scroll_2AR) $("li a[href=#speech2AR]").addClass("btn btn-info");


        $("#aff1").val(r.aff1);
        $("#aff2").val(r.aff2);
        $("#neg1").val(r.neg1);
        $("#neg2").val(r.neg2);
        $("#judge1").val(r.judge1);


        if (!r.status_aff1)
            $("#aff1").addClass("btn-info");
        else
            $("#aff1").removeClass("btn-info").attr("disabled", true);

        if (!r.status_aff2)
            $("#aff2").addClass("btn-info");
        else
            $("#aff2").removeClass("btn-info").attr("disabled", true);

        if (!r.status_neg1)
            $("#neg1").addClass("btn-info");
        else
            $("#neg1").removeClass("btn-info").attr("disabled", true);

        if (!r.status_neg2)
            $("#neg2").addClass("btn-info");
        else
            $("#neg2").removeClass("btn-info").attr("disabled", true);

        if (!r.status_judge1)
            $("#judge1").addClass("btn-info");
        else
            $("#judge1").removeClass("btn-info").attr("disabled", true);



        //block opp side input
       // $(".speech").attr("contenteditable", false);

        if (r.aff1 == u.email || r.aff2 == u.email )
            r.mySide = "aff";
        else if (r.neg1 == u.email || r.neg2 == u.email )
            r.mySide = "neg";

        $("#speech1AC, #speech2AC, #speech1AR, #speech2AR").addClass("aff");
        $("#speech1NC, #speech2NC, #speech1NR, #speech2NR").addClass("neg");


        $("#roundcreate").text("Resend");


        if (r.status_aff1 && r.status_aff2 && r.status_neg1 && r.status_neg2 && r.status_judge1)
            $("#roundcreate").hide();
        else
            $("#roundcreate").show();


    })


}





//SOCKET LISTENERS




socket.on('round_newTextForEnemy', function (r) {

    $("#" + r.speechName).html(r.speechPartial);

});


socket.on('round_newTextForPartner', function (msg) {

    $.getJSON("/round/read", {roundId: r._id}, function (r) {

        $("#speech1AC").html(r.speech1AC);
        $("#speech1NC").html(r.speech1NC);
        $("#speech2AC").html(r.speech2AC);
        $("#speech2NC").html(r.speech2NC);
        $("#speech1NR").html(r.speech1NR);
        $("#speech1AR").html(r.speech1AR);
        $("#speech2NR").html(r.speech2NR);
        $("#speech2AR").html(r.speech2AR);

    });

});



