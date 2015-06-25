


var u = {};

var local = !navigator.onLine;




if (local){

  u = true;

  if (!localStorage.debate) {
      localStorage.debate_local0 = '{"userid":"local","title":"First","text":"First file","id":"local0"}';
      localStorage.debate = '[{"id":"local0","title":"First","type":"file","children":[]}]';
  }

  u.index = JSON.parse(localStorage.debate);

  //init filetree
  ft.init($('#filetree'), u.index);

}else{

  $.getJSON("/user", function (userJSON) {

      u = userJSON || { };


      if (u.index) { //user logged in
           console.log(u.index);
           u.index = JSON.parse(u.index);

          

           var customCSS = $("<style>").appendTo('head');
           customCSS.html(u.custom_css)

           var customJS = $("<script id='custom_script'>");
           customJS.html(u.custom_js)
           customJS.appendTo('body');


          //remember to reauth
          document.cookie='debatesynergylogin=true; expires=Mon, 1 Jan 2020 20:20:20 UTC; path=/';

           //if (u.debatetype == 2) {

            //   $("#aff2, #neg2").hide();
          //     $("a[href='#speech2AC'], a[href='#speech2NC']").parent().hide();





        } else if (document.cookie.indexOf("debatesynergylogin=")>-1){ //force login re-auth          
            document.location.pathname = '/auth';

        } else {  //give login button

             $("#showround").click();

            $("#sidebar").prepend($("<div>").addClass(" btn btn-danger btn-google-oauth"))
            .find('.btn-google-oauth').click(function () {
                document.location.pathname = '/auth';
            });

           u.index = [{"id": "home", "title": "Welcome","type":"file"}, {"id": "manual", "title": "Manual", "type":"file"}];
          
        };


        //init filetree
        ft.init($('#filetree'), u.index);

    });


}


//$.ajax({type:"GET", cache: false, url: "http://debatesynergy.com/?1", error: function(){ local = true;}});


$(document).ready(function() {
  
  $(".ft-name").on('touchstart', function(e){  window.touchTimer = setTimeout(function(){ alert()} , 500); })

            .on('touchend', function() {
                clearTimeout(window.touchTimer);
            });

    //mobile swipe to toggle sidebar
    var touchStart;

    $('body').on('touchstart', function(e){
        touchStart = e.originalEvent.changedTouches[0].pageX;
    })

    $('body').on('touchend', function(e){
        dist =  e.originalEvent.changedTouches[0].pageX - touchStart;
      
        if (Math.abs(dist) >= 100)
          if (dist < 0){
            $("#docs").css("width","100%");
            $("#sidebar").animate({'marginLeft': '-35%'}, 500);
          } else {
            $("#docs").css("width","65%");
            $("#sidebar").animate({'marginLeft': '0'}, 500);
          }
    })


    //hash change to load doc
    function loadHash(){
      if ($(location.hash).length && ft.selected.id != location.hash.replace('#','')){
        
        $(location.hash).click();
      } else if (location.hash=="#manual"){ 
        ft.selected=false;
        $(".doc").hide('slow');
        $("#doc-manual").show('slow');
      } 
      else if (location.hash)
        $.get("/doc/read", {id: location.hash.replace("#",'')}, function (r) {
            if (r=="Access denied")
              alert(r);
        })
    }

    $(window).on('hashchange', loadHash);
    if (location.hash)
      loadHash();
     


  //file upload
  document.body.addEventListener("dragover", function (e) {
    e.preventDefault();
  }, false);

  document.body.addEventListener("drop", function (e) {
    e.preventDefault();

    var files = e.dataTransfer.files;
    console.log(files)

    var reader = new FileReader();
    

    $.each(files, function(i, j)  {
        var reader = new FileReader();
        
        reader.onload = function(e) {
          console.log(e.target);
          fileText = e.target.result;
          alert(files[i].name + "\n"+ fileText);
        }
        reader.readAsDataURL(files[i]);
       // reader.readAsText(files[i]);
    });

  }, false);

    

  //upload only when needed

  new MutationObserver(function(mutations) {
      mutations.forEach(function(i) {
        console.log(i)
      })
  }).observe($(".doc")[0], {childList: true});



  //resizable sidebar
  var dragStart = 0;
  $("#sidebar").on('mousemove',function(e){
      if($(this).width() - e.offsetX < 15)
          $("body").css('cursor','ew-resize');
      else if(!dragStart)
           $("body").css('cursor','');
  })
  .on('mouseout',function(e){
    if(!dragStart)
        $("body").css('cursor','');
  })
  .on('mousedown',function(e){
      if($(this).width() - e.offsetX < 15)
          dragStart = e.pageX;
      
      $("body").bind('mousemove',function(e){
         e.preventDefault();
      })
  });
  $("body").on('mouseup',function(e){
      $("body").unbind('mousemove');
      if (dragStart){
          $("#sidebar").css('width',e.pageX+'px');
          dragStart=0;
      }
  })




	//timer
	t.init();

  $("#round").hide();



  if(!local){

    //$("head").append($("<script src='http://apis.google.com/js/client.js?onload=gapiInit'>"));

    $("#import_googledrive").show();

  }

  //key shortcuts F1-F8
  $(window).keydown(function(e){
      if(e.keyCode >= 112 && e.keyCode <120 ){

        k = (e.keyCode - 112);
        e.preventDefault();
        $("#controls button")[k].click();
      }
  })


//mobile
if ($(document).width() < 700) {
    $(".nav-pills").removeClass("nav-justified").addClass("mobile").css("height", "20%");
    $(".tab-content").css("height", "80%");

    $('#sidebar').css("width","35%");
	$('.docs').css("width","65%");

}



setInterval(function() {
    ft.update();
}, 3000);

window.setTimeout(function() {

	if ($('.ft-selected').length)
		$('.ft-selected').click();
	else
	    $('.ft-name:first').click();


}, 1000);

// remove # from login
if (location.href.endsWith('#'))
  history.replaceState({}, document.title, "/");




//EDITOR


//correct paste formating

$("#docs")[0].addEventListener("paste", function(e) {
    e.stopPropagation();
    e.preventDefault();
    console.log(e);
    var data = e.clipboardData.getData("text/html");
    if(!data.length)
      data = e.clipboardData.getData("text/plain");


    data = data.replace(/ class="western"/gi,'');

    range = window.getSelection().getRangeAt(0);
    node = range.createContextualFragment(data);
    range.insertNode(node);


    if (data.indexOf("<meta") ){



        $("#info").append('<div class="alert alert-success alert-dismissable">' +
          '<button  class="close" data-dismiss="alert" aria-hidden="true">&times;</button>' +
          'Would you like to standardize formatting pasted from Word document? <button data-dismiss="alert" class="btn btn-xs btn-primary">Accept</button></div>')
          .find(".btn-primary").click(function () {
              $("#editor style, #editor meta ").remove();

              $("#editor h4").each(function(){ //verbatim
                $(this).html($("<b>").html($(this).html()));
              })
          })


    }


}, true);


//ctrl click to select whole card
$("#docs").click(function(e){

  if (!e.ctrlKey)
  return;

  e=$(e.target);
  var p=e.closest("p");


  function type(p){
    var u=p.find("u").length;
    var b=p.find("b").length;
    var a=p.find("*").length;



    if (!b && !u)
    return 0;
    else if(u > 1 || a > 4)
    return 3;
    else if (p[0] && p[0].nodeName=="OL")
    return 1;
    else if(b < a)
    return 2;
    else if (b == 1 && a < 4 )
    return 1;
   
    
  }

  start = p;
  if (type(p)==1)
    start = p;
  else if (type(p.prev())==1)
    start = p.prev();
  else if (type(p.prev().prev())==1)
    start = p.prev().prev();
  else if (type(p.prev().prev().prev())==1)
    start = p.prev().prev().prev();

  end = p;
  if (type(p)==3)
    end = p;
  else if (type(p.next())==3)
    end = p.next();
  else if (type(p.next().next())==3)
    end = p.next().next();


  range = document.createRange();
  range.setStart(start[0], 0);
  range.setEnd(end[0], end[0].childNodes.length);
  sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);

})




});


//gapi drive load
var apiKey = 'AIzaSyDgdM5CpdzE3dLHD877L8fB3PyxVpV7pY4';
var authToken;

function gapiInit() {
  gapi.client.setApiKey(apiKey);
  gapi.auth.authorize({
        client_id: '675454780693-7n34ikba11h972dgfc0kgib0id9gudo8.apps.googleusercontent.com',
        scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive'],
        immediate: true
    }, function (res) {
      authToken = res.access_token;
      gapi.client.load('drive', 'v2', function(){});
      gapi.load('picker', {'callback': function(){}});
  });
}

//google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-34608293-1', 'debatesynergy.com');
ga('send', 'pageview');