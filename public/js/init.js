//analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-79203150-1', 'auto');
ga('send', 'pageview');




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
  $('<button type="submit" id="login">Sign In</button>').prependTo("#sidebar").click(function(){
    location.href='/login';
  })


      //show round panel + manual index, unless it's a public file
  if (location.pathname.length<2) {
    loadResourcesDelay = 1


    // $("#ft-minimize-unread").click();

    u = {index: JSON.parse('[{"id":"manual","title":"Debate Synergy Manual","type":"file selected","children":'+
    '[{"title":"Welcome to Debate Synergy","type":"h h1"},{"title":"Manual","type":"h h1"},{"title":"Debate Sidebar Word AddIn ","type":"h h1"}]}]')};
  } else
    u = {index:[]}

};


// if (nochromeext)
$('head').append('<link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/noecbaibfhbmpapofcdkgchfifmoinfj">')

//init filetree
if (u.index=="local"){
  // filetree.innerHTML = localStorage.index;
  // u.index=ft.toJSON()


}

  ft.init($('#filetree'), u.index);

//RESOURCE DELAYED LOADER
var loadResourcesDelay = window.loadResourcesDelay || 3000
setTimeout(function (){


      $.get("/html/interface.panels.html", function(resourcesHtml){

        $('body').append(resourcesHtml);

        initRoundPanel();
        initRoundActions();
        initTimer();
        initControls();

        //init flow-mode
        initFlow()

        if (!u.name && location.pathname.length<2)
          $("#showround").click();

      })

}, loadResourcesDelay);



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
  // $("#ft-minimize-unread").click();



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
  $('#manual:first').click();

  // $("#docs").load("/html/manual.html")

  // $.get("/doc/read",{id:"manual"}, function(html){
  //
  //  $("#docs").html(html);
  //
  // })

  window.scrollTo(0,0)

} else if ($('.selected,.opened').length){ //click file tree last selected from filetree
  loadFile($('.selected,.opened').eq(0).attr('id'))
} else {
  $('.file:first').click();
}





})//dom ready
