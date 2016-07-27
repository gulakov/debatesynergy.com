$(document).ready(function(){



//MOBILE: swipe to toggle sidebar
$('body').on('touchstart', function(e) {
window.touchStart = e.originalEvent.changedTouches[0].pageX;
}).on('touchend', function(e) {
var dist = window.touchStart ? e.originalEvent.changedTouches[0].pageX - window.touchStart : 0;

if (dist < -100) {
  $("#sidebar").animate({
    'marginLeft': "-"+$("#sidebar").width()
  }, 0);
  $("#docs").animate({
    'paddingLeft': "0"
  }, 0);
} else if (dist > 100){
  $("#sidebar").animate({
    'marginLeft': '0'
  }, 0);

  $("#docs").animate({
    'paddingLeft': '20%'
  }, 0);
}
})

if(window.innerWidth <= 800 ) {

  // $('<meta name="theme-color" content="#AACFE7"/> '+
  // ' <meta name="viewport" content="minimal-ui, width=device-width, '+
  // 'initial-scale=1.0, maximum-scale=1.0, user-scalable=0"/>  '+
  // '<meta name="mobile-web-app-capable" content="yes"/>').prependTo("head")

}



//SIDEBAR resizable
window.dragSidebar = false;
$("#sidebar").on('mousemove',function(e){
  if($(this).width() - e.offsetX < 10)
      $("body").css('cursor','e-resize');
  else if(!dragSidebar)
       $("body").css('cursor','');
})
.on('mouseout',function(e){
if(!dragSidebar)
    $("body").css('cursor','');
})
.on('mousedown touchstart',function(e){
  var start = e.originalEvent.touches ? e.originalEvent.touches[0].clientX : e.offsetX;
  if($("#sidebar").width() - start > 20)
    return;


  dragSidebar = true;

  $("body").on('mousemove touchmove',function(e){
     e.preventDefault();
  })
  .on('mouseup',function(e){
    $("body").off('mousemove mouseup touchend touchmove');

    if (dragSidebar){
        dragSidebar = false;
        e = e.originalEvent.touches ? e.originalEvent.changedTouches[0] : e;

        $("#sidebar").css('max-width',e.pageX+'px');
        $.post("/user/update", {options: {sidebar: e.pageX }});
    }
  })
  .on('touchend',function(e){
    $("body").off('mousemove mouseup touchend touchmove'); //swipe conflict

    if (dragSidebar){
        dragSidebar = false;
        e = e.originalEvent.touches ? e.originalEvent.changedTouches[0] : e;

        $("#sidebar").css('max-width',e.pageX+'px');
        $.post("/user/update", {options: {sidebar_mobile: e.pageX }});
    }
  })


});

}) //END DOCUMENT READY





var xPos = null;
var yPos = null;
window.addEventListener( "touchmove", function ( event ) {
    var touch = event.touches[ 0 ];
    oldX = xPos;
    oldY = yPos;
    xPos = touch.pageX;
    yPos = touch.pageY;
    if ( oldX == null && oldY == null ) {
        return false;
    }
    else {
        if ( Math.abs( oldX-xPos ) > Math.abs( oldY-yPos ) ) {
            event.preventDefault();
            return false;
        }
    }
} );



/**** KEYBOARD SHORTCUTS ****/

//key shortcuts F1-F8
$(window).keydown(function(e) {

    if(e.which==83&&e.ctrlKey){
      e.preventDefault();

    //  window.off=false;
      ft.update();
    //  ft.updateIndex();
    //  window.off=1
      ;

    }






    if (e.keyCode >= 112 && e.keyCode < 120) { //F1-F8

      e.preventDefault();
      $("#controls button")[e.keyCode - 112].click();
    } else if (e.keyCode == 27) //ESC
      $("#searchtext").select2("open");

    })





//save file before closing tab
$( window ).on('beforeunload', function() {

//  ft.update();
});
