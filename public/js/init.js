//google analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
    m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','//www.google-analytics.com/analytics.js','ga');
ga('create', 'UA-34608293-1', 'debatesynergy.com');
ga('send', 'pageview');


var u = {};

var local = !navigator.onLine;




if (local){

  u = true;

  if (!localStorage.debate) {
      localStorage.debate_55513715b3d9f8a617ae8ba7 = '{"userid":"110755392257126764849","title":"First","text":"First file","createdAt":"2015-05-11T23:11:17.214Z","updatedAt":"2015-05-11T23:24:21.281Z","id":"55513715b3d9f8a617ae8ba7"}';
      localStorage.debate = '[{"id":"55513715b3d9f8a617ae8ba7","title":"First","type":"file","children":[]}]';
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

           $("#round").hide();

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

          
            $("#sidebar").prepend($("<div>").addClass(" btn btn-danger btn-google-oauth"))
            .find('.btn-google-oauth').click(function () {
                document.location.pathname = '/auth';
            });

           u.index  = [{  "id": "0",  "title": "Welcome","type":"file",
               "text": "<h1> Welcome to Debate Synergy</h1><p>Debate Synergy is a web app for high school and " +
               'college policy & LD debate teams to store online research, discuss debate in the forums, and livestream ' +
               'debate rounds. <a href="http://www.wired.com/2012/01/ff_debateteam/" onclick="window.open(\'http://www.wired.com/2012/01/ff_debateteam/\')">Featured in Wired magazine</a>. </p> '+
               ' <u>Edit this text or paste from Word to give it a try</u> <br/><br/> <a href="#" onClick="$.get(\'/download\', '+
                'function(resp){ document.getElementById(\'dl\').innerHTML= resp+ \' weekly downloads\'; }); ga(\'send\', \'event\', \'Download\');window.open(\'/files/Debate Sidebar Word AddIn Setup.exe\')" style="font-weight:bold">Download Debate Sidebar Word AddIn on Windows<br/><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQcAAAEHCAMAAACUdXOVAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyFpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMDE0IDc5LjE1Njc5NywgMjAxNC8wOC8yMC0wOTo1MzowMiAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6REU4MDVDMDZGRjQwMTFFNEIxNTdDMDlBOTI4RkU1MUIiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6REU4MDVDMDVGRjQwMTFFNEIxNTdDMDlBOTI4RkU1MUIiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIChXaW5kb3dzKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkVEODRDMjcxQjNDRDExRTM4ODAwREMyQTM3QzA4NDEwIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkVEODRDMjcyQjNDRDExRTM4ODAwREMyQTM3QzA4NDEwIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+xHmADAAAAGBQTFRF+K5RkNv/jo6L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"> </a><br /> <span id="dl"></span>'},
               {   "id": "1",   "title": "Manual","type":"file",   "text": "<h1>Manual</h1> <p> Interface similar to Word to edit all your files. </p>" }];
          
        };


        //init filetree
        ft.init($('#filetree'), u.index);

    });


}


//$.ajax({type:"GET", cache: false, url: "http://debatesynergy.com/?1", error: function(){ local = true;}});


$(document).ready(function() {
  


    //mobile swipe
  
    var touchsurface = document.body,
    swipedir,
    startX,
    startY,
    distX,
    distY,
    threshold = 150, //required min distance traveled to be considered swipe
    restraint = 100, // maximum distance allowed at the same time in perpendicular direction
    allowedTime = 300, // maximum time allowed to travel that distance
    elapsedTime,
    startTime;
  
    touchsurface.addEventListener('touchstart', function(e){
        var touchobj = e.changedTouches[0]
        swipedir = false
        dist = 0
        startX = touchobj.pageX
        startY = touchobj.pageY
        startTime = new Date().getTime() // record time when finger first makes contact with surface
        
    }, false)
  
   
    touchsurface.addEventListener('touchend', function(e){
        var touchobj = e.changedTouches[0]
        distX = touchobj.pageX - startX // get horizontal dist traveled by finger while in contact with surface
        distY = touchobj.pageY - startY // get vertical dist traveled by finger while in contact with surface
        elapsedTime = new Date().getTime() - startTime // get time elapsed
        if (elapsedTime <= allowedTime){ // first condition for awipe met
            if (Math.abs(distX) >= threshold && Math.abs(distY) <= restraint){ // 2nd condition for horizontal swipe met
                swipedir = (distX < 0)? 'left' : 'right' // if dist traveled is negative, it indicates left swipe
            }
            else if (Math.abs(distY) >= threshold && Math.abs(distX) <= restraint){ // 2nd condition for vertical swipe met
                swipedir = false // (distY < 0)? 'up' : 'down' // if dist traveled is negative, it indicates up swipe
            }
        }
          
        if (swipedir=='left')
          $("#sidebar").show();
       if (swipedir=='right'){
          $("#editor").css("width","100%")
          $("#sidebar").hide();
       }

    }, false)


  

  //hash change
  function loadHash(){

    if ($(location.hash).length)
      $(location.hash).click();
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
  }).observe($("#editor")[0], {childList: true});



  



	//timer
	t.init();



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
	$('#editor').css("width","65%");

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

$("#editor")[0].addEventListener("paste", function(e) {
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
$("#editor").click(function(e){

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


