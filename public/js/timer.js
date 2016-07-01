
$(document).ready(initTimer);

function initTimer(){


  //configure initial time values
  var timeset = (u.options && u.options.debatetype == 2) ? [9,6,10] : (u.options && u.options.debatetype == 3) ? [6, 7, 4] : [8,5,8];
  var count = timeset[0] * 60;

  $("#btn-timer-crossx").html("3");
  $("#btn-timer-constructive").html(timeset[0]);
  $("#btn-timer-rebuttal").html(timeset[1]);
  $("#btn-timer-aff, #btn-timer-neg").html(timeset[2]);
  $("#count").val(toTime(count));



  //sets to Timer.interval a function that checks every second if timer is running, displays decreased second count, and flashes red with sound on complete
  function createTimerInterval() {
      window.timerInterval = setInterval(function() {
        if (count <= 0)
          return;

        count--;
        if (!count) {
          $("#btn-play-container").click();

          beep_final.play();

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
      clearInterval(timerInterval);
    else
      createTimerInterval();

    beep.play();

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
