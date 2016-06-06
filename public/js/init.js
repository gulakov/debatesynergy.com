$(document).ready(function(){

//if user logged in, initiallize settings and index
if (u) {

  var customCSS = $("<style>").appendTo('head');
  customCSS.html(u.custom_css)

  var customJS = $("<script id='custom_script'>").html(u.custom_js);
  customJS.appendTo('head');

  if (u.options && u.options.sidebar)
      $("#sidebar").css('max-width', u.options.sidebar+'px');

  //LD
  if (u.options &&  u.options.debatetype==3){

    $(".nav-item:has(.nav-link[href='#speech2AC']), .nav-item:has(.nav-link[href='#speech2NC']), .nav-item:has(.nav-link[href='#speech1NR'])").remove()

    $(".nav-link[href='#speech1AC']").text("AC")
    $(".nav-link[href='#speech1NC']").text("NC")

    $(".nav-link[href='#speech2NR']").text("NR")
    $("#aff2+span,#neg2+span").hide()

  }

  for (var n in u.notifications)
    if(u.notifications[n].type=="round_youAreInvited")
      roundInviteAlert(u.notifications[n])
    else if (u.notifications[n].type=="doc_share")
      docShareAlert(u.notifications[n])




} else { //no user, show default page

  //google sign in
  $("#login").show().click(function(){
    location.href='/login';
  })


      //show round panel + manual index, unless it's a public file
  if (location.pathname.length<2) {

    $("#showround").click();

    $("#ft-minimize-unread").click();

    u = {index: JSON.parse('[{"id":"manual","title":"Debate Synergy Manual","type":"file selected","children":'+
    '[{"title":"Welcome to Debate Synergy","type":"h h1"},{"title":"Manual","type":"h h1"},{"title":"Debate Sidebar Word AddIn ","type":"h h1"}]}]')};
  } else
    u = {index:[]}

};

//init filetree
ft.init($('#filetree'), u.index);

//RESOURCE DELAYED LOADER
setTimeout(function(){

    $.get("/html/interface.panels.html", function(resourcesHtml){

      $('body').append(resourcesHtml)

    })

}, 2000)


// //reset scrolls
// setInterval(function () { return;
//
//
//
//
//
// //	window.scrollTo(0,200)
//
// }, 2000)

  //minimize unread by default
  $("#ft-minimize-unread").click();



//URL fileID change to load debate file
//TODO back fwd overrites hisory non sequential because of push state on back button

function loadFileHash(id) {

  if (u.index && u.index.filter(function(i){ return i.id == id}).length && ft.selected.id != id) {
    $('#' + id).click();
  } else {
    loadFile(decodeURIComponent(id).replace(/[\W]+/g,''))
  }
}

//$(window).trigger('popstate')
$(window).on('popstate', loadFile);
var fileId = location.pathname.substr(1);
if (fileId && fileId != "#"){ //load if file id/name in url
  loadFileHash(fileId);
} else if (!u.name || u.index[0].id=="manual"){ //guest home page
  $('.ft-item:first').click();

  $("#docs").load("/html/manual.html")

  $.get("/doc/read",{id:"manual"}, function(html){

   $("#docs").html(html);

  })

  window.scrollTo(0,0)

} else if ($('.selected,.opened').length) //click file tree last selected from filetree
  $('.selected,.opened').eq(0).click();









//MOBILE: swipe to toggle sidebar
$('body').on('touchstart', function(e) {
window.touchStart = e.originalEvent.changedTouches[0].pageX;
}).on('touchend', function(e) {
var dist = window.touchStart ? e.originalEvent.changedTouches[0].pageX - window.touchStart : 0;

if (dist < -100) {
  $("#sidebar").animate({
    'marginLeft': "-"+$("#sidebar").width()
  }, 250);
  $("#docs").animate({
    'paddingLeft': "0"
  }, 250);
} else if (dist > 100){
  $("#sidebar").animate({
    'marginLeft': '0'
  }, 250);

  $("#docs").animate({
    'paddingLeft': '20%'
  }, 250);
}
})

if ($(document).width() < 700) {

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
