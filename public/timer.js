function Timer() {
  
  var count = 8 * 60, type, options = {
    "times_r": 5,
    "times_c": 8,
    "times_x": 3,
    "times_p": 8
  };
  
  setInterval(function() {
    if ($("#btn-play").hasClass("play"))
      return;

    if (count <= 0)
      return;

    count--;
    console.log(count)
    if (!count) {
      $("audio")[1].play();

      $("body").append('<div id="timeup" style="position: absolute; height: 100%; width: 100%;top: 0;left: 0;z-index: 9999;background-color: red;"></div>')
        
      setTimeout(function() {
        $("#timeup").remove();
      }, 2000)
    }


    $("#count").val(toTime(count));

    if (type == "btn-timer-aff" || type == "btn-timer-neg")
      $("#" + type).html($("#count").val())



  }, 1000)

  var toTime = function(n) {
    return Math.floor(n / 60) + ":" + (n % 60 < 10 ? "0" : "") + n % 60;
  }

  var toNumber = function(s) {
    //M:SS MM:SS M SS MSS MMSS
    return (parseInt(s.substring(0, s.indexOf(":") > -1 ? s.indexOf(":") : s.length > 1 ? s.length - 2 : 1)) || 0) * 60 +
      (parseInt(s.substring(s.indexOf(":") > -1 ? s.indexOf(":") + 1 : s.length > 1 ? s.length - 2 : 1)) || 0);

  }



  $("#btn-timer-aff, #btn-timer-neg").html(options.times_p);
  $("#btn-timer-crossx").html(options.times_x);
  $("#btn-timer-constructive").html(options.times_c);
  $("#btn-timer-rebuttal").html(options.times_r);

  
  $("#count").val(toTime(count));


  $("#btn-play-container").click(function() {
    
    $("#btn-play").toggleClass("play").toggleClass("pause");
    $("audio")[0].play();

  })

  $("#btn-timer-aff, #btn-timer-neg, #btn-times-container > div").click(function() {
    type = this.id;
    count = (parseInt($(this).html()) || 0) * 60;
    $("#count").val(toTime(count));
  })

  $("#count").mousedown(function(e) {
    if ($("#btn-play").hasClass("pause"))
      $("#btn-play-container").click();
  })

  $("#count").keypress(function(e) {
    if (e.keyCode == 13)
      $("#btn-play-container").click();

    return (e.keyCode >= 48 && e.keyCode <= 58);
  })

  $("#count").change(function(e) {
    count = toNumber($(e.target).val());

    $("#count").val(toTime(count));
  })

}

