function Timer() {

  //configure initial time values
  var timeset = (u.options && u.options.debatetype == 2) ? [9,6,10] : (u.options && u.options.debatetype == 3) ? [6, 7, 4] : [8,5,8];
  var count = timeset[0] * 60;

  $("#btn-timer-crossx").html("3");
  $("#btn-timer-constructive").html(timeset[0]);
  $("#btn-timer-rebuttal").html(timeset[1]);
  $("#btn-timer-aff, #btn-timer-neg").html(timeset[2]);
  $("#count").val(toTime(count));


  $("#timer").append('<audio autobuffer="autobuffer"> <source src="data:audio/mp3;base64,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" /> </audio> <audio autobuffer="autobuffer"> <source src="data:audio/mp3;base64,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" /> </audio>')


  //sets to Timer.interval a function that checks every second if timer is running, displays decreased second count, and flashes red with sound on complete
  Timer.setInterval = function () {
      Timer.interval = setInterval(function() {
        if (count <= 0)
          return;

        count--;
        if (!count) {
          $("#btn-play-container").click();

          $("audio")[1].play();

          $("body").append('<div id="timeup" style="position: absolute; height: 100%; width: 100%;top: 0;left: 0;z-index: 9999;background-color: red;"></div>')

          setTimeout(function() {
            $("#timeup").remove();
          }, 2000)
        }


        $("#count").val(toTime(count));

        var type =   $("#count").attr("class");
        if (type == "btn-timer-aff" || type == "btn-timer-neg")
          $("#" + type).html($("#count").val())



    }, 1000)
  };

  //seconds interger to M:SS string
  function toTime(n) {
    return Math.floor(n / 60) + ":" + (n % 60 < 10 ? "0" : "") + n % 60;
  }

  //time string to seconds interger these formats M:SS MM:SS M SS MSS MMSS
  function toNumber(s) {
    var twodots = s.indexOf(":");

    return (parseInt(s.substring(0, twodots > -1 ? twodots : s.length > 1 ? s.length - 2 : 1)) || 0) * 60 +
      (parseInt(s.substring(twodots > -1 ? twodots + 1 : s.length > 1 ? s.length - 2 : 1)) || 0);
  }


  //play/pause button sets interval function and tick sound
  $("#btn-play-container").click(function() {

    $("#btn-play").toggleClass("play").toggleClass("pause");

    if ($("#btn-play").hasClass("play"))
      clearInterval(Timer.interval);
    else
      Timer.setInterval();

    $("audio")[0].play();

  })

  //prep buttons set new time and class of time display as button's id
  $("#btn-timer-aff, #btn-timer-neg, #btn-times-container > div").click(function() {
    count = toNumber($(this).text()) || 0;
    if (count==10) count = 10*60;
    $("#count").val(toTime(count)).attr("class", this.id);
  })

  //clicking into the text displaying time enables changing it, converts to allowed time string on enter
  $("#count").mousedown(function(e) {
    if ($("#btn-play").hasClass("pause"))
      $("#btn-play-container").click();
  }).keypress(function(e) {
    if (e.keyCode == 13){
      e.preventDefault();
      $(this).blur();
      $("#btn-play-container").click();
    }
    return (e.keyCode >= 48 && e.keyCode <= 58);
  }).change(function(e) {
    count = toNumber($(e.target).val());
    $("#count").val(toTime(count));
  })

}
