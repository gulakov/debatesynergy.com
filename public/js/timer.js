var t = {};

t.init = function(){


    $('<audio autobuffer="autobuffer"><source src="data:audio/mp3;base64,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"/></audio>'+
      '<audio autobuffer="autobuffer"><source src="data:audio/mp3;base64,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"/></audio>')
      .appendTo('body');

    t.options = {"times_r": 5, "times_c": 8, "times_x": 3, "times_p": 8};

    $("#btn-timer-aff, #btn-timer-neg").html( t.options.times_p );
    $("#btn-timer-crossx").html( t.options.times_x );
    $("#btn-timer-constructive").html( t.options.times_c );
    $("#btn-timer-rebuttal").html( t.options.times_r );

    t.count = 8*60;

    $("#count").val( t.toTime(  t.count ) );


    t.ticker = setInterval(t.tick, 1000);


    $("#btn-play-container").click(function(){
        t.on = !t.on;
        $("#btn-play").toggleClass("play").toggleClass("pause");
        $("audio")[0].play();

    })

    $("#btn-timer-aff, #btn-timer-neg, #btn-times-container > div").click(function(){
        t.type = this.id;
        t.count = (parseInt($(this).html())||0)*60;
        $("#count").val( t.toTime(  t.count ) );
    })

    $("#count").mousedown(function(e){
        if (t.on)
          $("#btn-play-container").click();
    })

    $("#count").keypress(function(e){
        if (e.keyCode == 13)
          $("#btn-play-container").click();

        return (e.keyCode >= 48 && e.keyCode <= 58);
    })

    $("#count").change(function(e){
        t.count = t.toNumber ( $(e.target).val() );

        $("#count").val( t.toTime(  t.count ) );
    })



}

t.tick = function(){
     if ($("#btn-play").hasClass("play"))
          return;

    if (t.count<=0)
        return;

        t.count--;
    if (!t.count){
      $("audio")[1].play();

      $("body").css("background-color", "red");

      setTimeout(function(){

        $("body").css("background-color", "");
      }, 2000)
    }


    $("#count").val( t.toTime(  t.count ) );

    if ( t.type == "btn-timer-aff" || t.type == "btn-timer-neg")
        $("#" + t.type).html( $("#count").val() )



}

t.toTime = function(n){
    return Math.floor(n/60) + ":" + ( n%60<10 ? "0" : "" ) + n%60;
}

t.toNumber = function(s){
   //M:SS MM:SS M SS MSS MMSS
   return ( parseInt( s.substring(0, s.indexOf(":")>-1 ? s.indexOf(":") : s.length>1 ? s.length-2 : 1 ) ) || 0) * 60 +
      ( parseInt( s.substring( s.indexOf(":")>-1 ? s.indexOf(":") +1 : s.length>1 ? s.length-2 : 1  ) ) || 0);

}
