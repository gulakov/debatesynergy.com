var sidebarHtml = '<aside id="sidebar"> <div id="controls"> <select id="searchtext"></select> <button id="format-highlight" class="icon-sw-highlighter" title="Highlight underlined read card text"></button> <button id="readcard" title="Read text" class="icon-underline"></button> <button id="block" title="Heading" class="icon-header"></button> <button id="read" title="Bold" class="icon-bold"></button> <button id="format-remove" title="Clear formatting" class="icon-eraser"></button> <button id="showfileinfo" title="File Info &amp; Sharing" class="icon-share"></button> <button id="file-new" title="New File" class="icon-doc-new"></button> <button id="showsettings" title="Settings" class="icon-sliders"></button> <button id="showround" title="Round"></button> <div class="dropdown"> <button class="icon-ellipsis-vert"></button> <div class="dropdown-menu"> <button id="ft-minimize-unread" class="icon-fontsize"> Minimize Unread Text</button> <button id="ft-collapse" class="icon-tree"> Collapse Filetree</button> </div> </div> </div> <div id="filetree"></div> </aside>'


$(document).ready(function() {


    // $(sidebarHtml).prependTo('body')



//key shorcuts UHB

//
//   $(document).keydown(function(e){
//     if (getSelection().isCollapsed) return;
//
// if (e.which==66 ) {
//     document.execCommand('bold');  e.preventDefault()
// }
// if (e.which==72 ) {
//     $("#format-highlight").click();  e.preventDefault()
// }
// if (e.which==85 ) {
//     document.execCommand('underline');  e.preventDefault()
// }
// })

$(".btn").click(function(){ $(this).blur() })

  //SIDEBAR BUTTONS

  // $('[title]').tooltip();




  $("#block").click(function() {


    var headingToUse = "h1";
    var parentHeading = $(window.getSelection().anchorNode.parentNode).closest("h1");

    if (parentHeading.length > 0)
      parentHeading[0].outerHTML = parentHeading.html();
    else
    if (!document.execCommand('formatBlock', false, headingToUse)); //CH/FF
    document.execCommand('formatBlock', false, "<" + headingToUse + ">"); //IE




  })


  $("#read").click(function() {
    document.execCommand('bold');
  });


  $("#readcard").click(function() {
    document.execCommand('underline');
  })


/*


      var selectionContents = getSelection().getRangeAt(0).cloneContents();
      var div = $("<mark>").append(selectionContents);

    //  if (     window.highlightSelect == div.html() ) return;

      window.highlightSelect = div.html();

      var colorToUse = "white";

      //if inside selection there is any text range with non-white bg
      if(!div.find("*[style*=background-color]:not(*[style*=white])").length)
          colorToUse = "yellow";

        ///if inside parent thats all highlighted -- white
      var parentColor = $(window.getSelection().anchorNode.parentNode).closest("*[style*=background-color]").css("background-color");

      if ( parentColor && parentColor  != "rgb(255, 255, 255)")
        colorToUse = "white";

      //console.log( div.html() )
      document.execCommand('backColor', false, colorToUse);
*/

  $("body").on("mouseup", ".highlight-mode", function(e) {
  //console.log(e);

      var selectionContents = getSelection().getRangeAt(0).cloneContents();

      //alert user if selection doesn't contain u/b text that's eligible for highlighting
      if (!selectionContents.querySelector("b,u") && selectionContents.textContent.length > 50)
        alert("Only bold or underlined text in selection gets highlighted.", "warning", null, true)

      var firstNode = getSelection().anchorNode.parentNode;

      var isHighlighted = firstNode.closest("mark")


      $("#docs").toggleClass('strikeToggleMode')

     $("mark").each(function(){
      //  this.outerHTML=this.outerHTML.replace(/mark>/g,'strike>')
     })

      document.execCommand('italic')


      $("strike").each(function(){
        // this.outerHTML=this.outerHTML.replace(/strike>/g,'mark>')
      })



            $("#docs").toggleClass('strikeToggleMode')

          $("#docs *[style*='font-style: italic']").css('font-style','normal').wrap('<i>')

        getSelection().collapseToStart()

         return;

        var selectionContents = $("<span>").append(selectionContents ).html()


        if (isHighlighted){

          var aOff = getSelection().anchorOffset;
          var aText = getSelection().anchorNode.textContent;
          getSelection().anchorNode.textContent =
              aText.substring(0,aOff) + "</mark>" + aText.substring(aOff);

              var selHtml = getSelection().anchorNode.parentNode.innerHTML;

              //  getSelection().anchorNode.parentNode.innerHTML =
              //   selHtml.replace('&gt;','>').replace('&lt;','<')


          //endNode


          var aOff = getSelection().focusOffset;
          var aText = getSelection().focusNode.textContent;
          getSelection().focusNode.textContent =
              aText.substring(0,aOff) + "<mark>" + aText.substring(aOff);

              var selHtml = getSelection().focusNode.parentNode.innerHTML;



               var par = $(getSelection().focusNode.parentNode)
                par.closest("section").html(
                    par.closest("section").html().replace(/&gt;/g,'>').replace(/&lt;/g,'<')
                  )

        }else{
          selectionContents = "<mark>"+selectionContents+"</mark>";


            pasteHtmlAtCaret(selectionContents)
      }



      /*
      var colorToUse = "white";

      //if inside selection there is any text range with non-white bg
      if(!div.find("*[style*=background-color]:not(*[style*=white])").length)
          colorToUse = "yellow";

        ///if inside parent thats all highlighted -- white
      var parentColor = $(window.getSelection().anchorNode.parentNode).closest("*[style*=background-color]").css("background-color");

      if ( parentColor && parentColor  != "rgb(255, 255, 255)")
        colorToUse = "white";

      //console.log( div.html() )
      document.execCommand('backColor', false, colorToUse);
      */


  //when highlighting United States only highlight US
  /*
  setTimeout(function(){
  if (colorToUse == "yellow"){
    if (  $(getSelection().anchorNode).closest("*").html().search(/( the |United States)/i) > -1)

    $(getSelection().anchorNode).closest("*").html(
      $(getSelection().anchorNode).closest("*").html().replace(/United States/g,
      'U<span style="background-color: white;">nited </span>S<span style="background-color: white;">tates</span>')

      .replace(/>the/gi,'> the').replace(/the</gi,'the <')
      .replace(/(^| )the( |$)/gi,
      '<span style="background-color: white;"> the </span>')


      )

  }


}, 500)*/


  getSelection().collapseToEnd()


});



  $("#format-highlight").click(function() {


    $("#docs").on("mouseenter", function(){
      $("#docs").off("mouseenter")

      if ($("#format-highlight").hasClass("active"))
          sw.play()
    })

    $(this).toggleClass("active")
    $("#docs, .speech").toggleClass("highlight-mode").trigger("mouseup");



  //  if ( 'ontouchstart' in window && $(window).width() < 700)
  //    $(".doc").attr("contenteditable", !$(this).hasClass("enabled"))

  })


  $("#format-remove").click(function() {


    //document.execCommand('removeFormat');
  //  return;

    var range = window.getSelection().getRangeAt(0);
    var selectionContents = range.toString();
    var div = document.createElement("span");

    div.innerHTML = "</b></u></h1></h4></span>"+selectionContents;
    range.deleteContents();
    range.insertNode(div);


  })


  /// ... end button dropdown menu
  //$('.dropdown-toggle').dropdown()


    $("#ft-collapse").click(function(){
        $(".file:not(.collapsed)").addClass('collapsed')
    })


    $("#ft-minimize-unread").click(function() {

      if ( $('#docs').hasClass('size-mode-1') ){
        $('#docs, .speech').addClass("size-mode-0").removeClass("size-mode-1");

      }else{
          $('#docs, .speech').addClass("size-mode-1").removeClass("size-mode-0");
      }

      $("#ft-minimize-unread .fa-margin").toggleClass('fa-check-square-o').toggleClass('fa-square-o')

    })



  $("#big").click(function() {

    window.setTimeout(function() {

      $(".ft-selected").click();
    }, 1000)

    u.big = !u.big ? 1 : u.big == 2 ? 0 : 2;



    var list = $(".tab-content .active p");

    for (var i = 0; i < list.length; i++)
      if (list[i].getBoundingClientRect().top > 0)
        break;





    if (u.big == 0) {

      $(".doc:visible, .speech").find("*[style]").filter(function() {
        return $(this).css('background-color') != "rgba(0, 0, 0, 0)";
      }).css("font-size", "").css("line-height", "")
      $("#docs, .speech").find("*[style*='yellow'], b, u, h1").css("font-size", "").css("line-height", "")
      $(".doc:visible, .speech").css("font-size", "100%")
    } else if (u.big == 1) {
      $(".doc:visible, .speech").find("*[style]").filter(function() {
        return $(this).css('background-color') != "rgba(0, 0, 0, 0)";
      }).css("font-size", "30pt").css("line-height", "100%");
      $(".doc:visible, .speech").find("*[style*='yellow'], b, u, h1").css("font-size", "30pt").css("line-height", "100%");
      $(".doc:visible, .speech").css("font-size", "30%");
    } else if (u.big == 2) {
      $(".doc:visible, .speech").find("u").css("font-size", "").css("line-height", "")

    }

    // list[i].scrollIntoView();


  })


  $("#showround").click(function() {
  if( $("#round").is(":visible") ){
        $("#round").hide();
        $("#docs").css("padding-right", 0)

    } else {
      openRoundPanel()
      $("#docs").css("padding-right", "45%")
    }

  });





}); //end dom
