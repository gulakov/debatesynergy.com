NodeList.prototype.forEach = Array.prototype.forEach;
//TODO create parenting -- when you're dragging the headings  have arrow icon under
//collapsible heading levels and auto load which level, dragging headigns into another documents

var ft = {
init: function(el, json) {

  ft.root = $(el);
  ft.dragging = false;
  ft.selected = {};

  //populate and events
  ft.populate(el, json);

  //click file or heading
  $("#filetree").on("click", "ul,li", ft.click)

  //FILE EXPAND COLLAPSE
  $("#filetree").on("click", "label", function(e){
    var fileNav = $(this).parent();

    fileNav.toggleClass('collapsed');

  })


  // prevent h-scroll of filetree
  $("#filetree").scroll(function(){
      this.scrollLeft=0;
  })





  // on scroll, highlight currently-viewed block in nav filetree


  function navScrollHeading(){

      var elem = document.elementFromPoint(filetree.offsetWidth+20,
            filetree.getBoundingClientRect().top  + filetree.clientHeight*.2 + 30);


      var closestHead = $(elem).closest("section>*").eq(0).prevUntil("h1,h2,h3").last()

      var headList = $("#doc-"+ft.selected.id).find("h1, h2, h3");
      this.worked=0;

      if (!closestHead) return
      for (var i=0; i < headList.length ; i++)
        if (headList.eq(i).text().length > 0 && headList.eq(i).is(closestHead)){
           this.worked = 1;
            break;



        }
        if (!this.worked) return


        $(".selected").removeClass("selected");
        $("#" + ft.selected.id).find("li").eq(i-2).addClass("selected");

        // if (i == headList.length)
        //   $("#" + ft.selected.id).next().children().last().find('.ft-name').addClass("ft-selected");

        if ($(".selected")[0] && document.body.scrollIntoViewIfNeeded)
          $(".selected")[0].scrollIntoViewIfNeeded();





    //      console.log($(".ft-selected")[0])
      //
      // if ($(".ft-selected")[0]){
      //   $(".ft-selected")[0].scrollIntoView();
      // //  if ( $(".ft-selected").offset().top < window.innerHeight/2)
      //     $("#filetree")[0].scrollTop -= filetree.clientHeight*.2
      //
      //  // $("#filetree")[0].scrollTop = $(".ft-selected").position().top-window.innerHeight/2+75
      // }

    }


  $(window).on("scroll", function(){
    clearTimeout(window.scrollThrottle);
    window.scrollThrottle = setTimeout(navScrollHeading, 500)

  });




  //update filetree and save every 5s
  // setInterval(function() {
   // if (typeof(MutationObserver) == "undefined")
    //  ft.updateNeeded = true;

    // ft.update();
  // }, 20000);

  //update triggered only when needed
  ft.updateNeeded = false;

/* //disabled, makes typing slow
  if (typeof MutationObserver != "undefined")
    new MutationObserver(function(m) {
      ft.updateNeeded = true;
    }).observe($("#docs")[0], {
      childList: true,
      subtree: true
    });

  */



  $("#docs").keyup(function(e){
    ft.updateNeeded = true;
    if ($(window.getSelection().anchorNode).closest("h1,h2,h3").length)
      ft.updateNeeded = true;

  })



  /* ENABLE FILE & HEADING DRAGGING */

  $('#filetree').on("dragstart", function(e) {
      ft.dragging = $(e.target).closest('nav');

      $(e.target).addClass("ft-being-dragged");
    })
  $(document).on("dragover", function(e) {
      e.preventDefault();
    })
  $('#filetree').on("dragenter", function(e) {
      e = $(e.target).closest('nav');
      if (e)
        e.addClass("ft-dragged-over")
    })
    .on("dragleave", function(e) {
      e = $(e.target).closest('nav');
      if (e)
        e.removeClass("ft-dragged-over")
    })
    .on("drop", function(e) {
      //this event is doubled by the "drop docx upload" so if file dropped cancel event
      if (e.originalEvent.dataTransfer && e.originalEvent.dataTransferuls.length) return;

      // prevent default action
      e.preventDefault();
      //ft-item receiving the drop
      var dropItem = $(e.target).closest("li,ul");

      if (dropItem.length){
        var dropClass = dropItem.attr('class').match(/(file|folder|heading)/gi);
        dropClass = dropClass.length ? dropClass[0] : false;
        //remove drop item's highlite
        dropItem.removeClass("ft-dragged-over").css("color", "none");
      }
      //TODO is this a copy?
      ft.dragging.removeClass("ft-being-dragged");

      console.log(ft.dragging);
      console.log(dropItem);

      //dropped outside the tree (no drop item)
      if (!dropItem.length) {
        $('#filetree > .ft-list > .ft-item:last').after(ft.dragging);

        //folder/file: dropped onto: folders (next, child),  files (next)
      } else if (ft.dragging.find(".ft-name").hasClass("folder") || ft.dragging.find(".ft-name").hasClass("ft-file")) {

        if (dropClass=="folder" && e.originalEvent.clientX > 30) { //dropping on folder makes it a child if over px from left
          if (!dropItem.find('.ft-list').length)
            dropItem.append("<div class='ft-list'>")

          dropItem.find('.ft-list').append(ft.dragging);

        } else if (dropClass=="folder" || dropClass=="ft-file") {

          dropItem.after(ft.dragging);
        } else //don't allow others
          return;


      //headings: dropped onto files (child) or headings (next)
      } else if (ft.dragging.find(".ft-name").hasClass("heading")) {

        if (dropClass=="ft-file") {
          if (!dropItem.find('.ft-list').length)
            dropItem.append("<div class='ft-list'>")

          dropItem.find('.ft-list').append(ft.dragging);

        } else if (dropClass=="heading") {

          dropItem.after(ft.dragging);
        } else //don't allow others
          return;

        //TODO headings in other files
        //move text block under the drag heading to the dropped heading location
        var dragId = ft.dragging.find(".ft-name").attr("id");
        dragId = parseInt(dragId.substring(dragId.indexOf("_") + 1));
        var dropId = parseInt(dropItem.find(".ft-name").attr("id").substring(dropItem.find(".ft-name").attr("id").indexOf("_") + 1));
        var headList = $("#doc-"+ft.selected.id).find("h1,h2,h3");
        var dropHead = headList.eq(dropId + 1);
        var dragHead = headList.eq(dragId)[0];
        var dragEnd = headList.eq(1 + dragId).prev()[0];


        var range = document.createRange();
        range.selectNodeContents(dragHead);
        range.setEnd(dragEnd, dragEnd.childNodes.length);

        var blockToMove = $("<span>");
        blockToMove.append(range.extractContents());

        console.log(blockToMove.html());
        dropHead.before(blockToMove);
      }

      //remove original item if got to this point
      $(".ft-being-dragged:first").closest('.ft-item').remove();

      //calculate new index JSON and upload it
      u.index = ft.toJSON();
      ft.updateIndex();

    });










},

/*
<ul draggable class="file opened collapsed" id=55b6077b4453ea391da4317f">
  <label>Hegemony Good</label>
  <li draggable class="h h1 selected">Soft Power 2ac-links</li>
  <li draggable class="h h1">Soft PO BAd</li>
</ul>
*/
// takes a div container on page to fill with supplied dom parsed into filetree
populate: function(div, json) {

  if (ft.root &&  div[0] && div[0].id == ft.root[0].id){
    //div.empty();
  }

    //author/share tooltip info // date crated/ added
    //title > name

  //convert array of [{id,type,..},{}] headings and return output html string
  function jsonArrayToHTMLString(json){

      var outputHTML = '';

      for (var i in json) {
        var item=json[i], itemHTML = '';
        item.type = (item.type||"").replace(/heading /g,'h ').replace(/heading-/g,'').replace(/ft-/g,'') ;

        if (!item.children && item.type.indexOf("collapsed")>-1)
          item.type+=" collapsed";


        if (item.type.indexOf("file")>-1 )
          itemHTML = "<ul draggable class='" + item.type + "' id='" + item.id + "'><label>" + item.title + "</label>"

        if (item.type.search(/h\d/i)>-1)
          itemHTML = "<li draggable class='" + item.type + "'><label>" + item.title + "</label>"


        if (item.children && item.children.length)
          itemHTML += jsonArrayToHTMLString(item.children);


          if (item.type.indexOf("file")>-1 )
              itemHTML += '</ul>';

          if (item.type.search(/h\d/i)>-1)
              itemHTML += '</li>';

        outputHTML+=itemHTML;

      }





      return outputHTML;

  } // end jsonArrayToHTMLString


  outputHTML = jsonArrayToHTMLString(json);

  //  console.log(outputHTML)
  div.append(outputHTML)

},

toJSON: function(startLevel) {
  if (typeof startLevel == 'undefined')
    startLevel = filetree;

  var array = [];



  $(startLevel).children("li").each(function(){
    var nav = $(this);

    var item = {
      id: nav.attr("id"),
      title: nav.children('label').text(),
      type: nav.attr("class")
    };




    var subNavs = nav.find('li');
    if (subNavs.length)
      item.children = ft.toJSON(subNavs);
    else
      item.type += " collapsed"

    array.push(item);
  });



  return array;

},


//save doc to server, update headings into index
update: function() {
//  if (window.off)return;

  u.index = ft.toJSON();

  //find the headings
  if (ft.selected && $("#doc-"+ft.selected.id).length && ft.updateNeeded
      && ft.selected.id == $("#doc-"+ft.selected.id).attr('id').substring(4) ){

    var headingList = [],  i = 0,  selectedId = -1;

// var selectedId = navFile.find("nav").index(nav);


    $("#doc-"+ft.selected.id)[0].querySelectorAll("h1, h2, h3").forEach(function(item) {


      if ($(item).text().length > 2) {
        headingList.push({
          'id': ft.selected.id + "_" + i.toString(),
          'title': $(item).text().substring(0, 50),
          'type':  $(item).prop("tagName").toLowerCase() + (selectedId == i ? " selected" : "")
        });

      }

      i++;

    });



    //add headings as children of current file to indexJSON
    for (var i in u.index)
      if (u.index[i].id == ft.selected.id){
        u.index[i].children = headingList;
        break;
      }

    console.log(headingList);

    //recreate index -- but only for the current doc to update its headings
    $("#"+ ft.selected.id).find("li").remove()
    ft.populate( $("#"+ ft.selected.id), headingList);


    //upload doc
    $.post({url: '/doc/update', contentType : 'application/json',
      data : JSON.stringify({
          text: $("#doc-"+ft.selected.id).html(),
          id: ft.selected.id
      })})


    //5s counter
    // ft.updateNeeded = false;
  }

  //save indexJSON
  ft.updateIndex();

},


//upload tree index to server
updateIndex: function() {
 if (!u.index.length || !u.name) return;

    $.post({url: '/user/update',
      data : JSON.stringify({userid: u._id, index: u.index}),
      contentType : 'application/json'})

},

//click on NAV ul or NAV .h1 or pass the id to click

click: function(e) {
  e.stopPropagation();

  var nav = typeof e == "string" ? $("#" + e) : $(e.currentTarget)


  //TODO loading file inderectly or always showign the file name selected even as headers change
  $('.selected').removeClass('selected');
  // nav.addClass('selected');

  //click on heading to go to it and if needed open the file its in
  if (nav.attr("class").search(/h\d/i)>-1) {

    var navFile = nav.parent();
    var id = navFile.attr('id')

    window.preloadHeading = nav.find("label").text();

    // debugger
    //double cliks! double laods
    var headingId = navFile.find("li").index(nav);



    function scrollToHeading(){
        $("#doc-"+ft.selected.id).find("h1, h2, h3")[headingId].scrollIntoView();
        //offset scroll level top
        $("#doc-"+ft.selected.id).scrollTop($("#doc-"+ft.selected.id).scrollTop() - 260);
    }

    //scroll to heading if triggered by click on heading within this currently-visible doc
    if (ft.selected.id == id)
      scrollToHeading();
    else //if clicked on header in unopened file, load that file, then go to header
      loadFile(id, scrollToHeading);

  //load file when clicked on filetitle
    } else if (nav.hasClass("file")) {

      loadFile(nav.attr('id'));

  }

}


//
// //same as single click, but then select the text inside or o
// dblclick: function() {
//
//   if ($(this).hasClass("heading")) {
//
//     var id = $(this).attr('id');
//
//     var headingId = parseInt(id.substring(id.indexOf("_") + 1));
//     id = id.substring(0, id.indexOf("_"));
//
//
//     var headingList = $("#doc-"+ft.selected.id).find("h1, h2, h3");
//
//     var endNode = headingId == headingList.length - 1 ? $("#docs>p:last")[0] : headingList[headingId + 1];
//
//
//     range = document.createRange();
//     range.setStart(headingList[headingId], 0);
//     range.setEnd(endNode, 0);
//     sel = window.getSelection();
//     sel.removeAllRanges();
//     sel.addRange(range);
//
//   }
//
//   if (!$(this).hasClass("ft-file") && !$(this).hasClass("folder"))
//     return;
//   //TODO what should dblclick/ longtouch on file titles do?
//
// }


};



  /*/long touch on mobile
  setTimeout(function() {

      .on('touchstart', function() {
        // e.preventDefault();
        window.touchTimer = setTimeout(ft.dblclick, 500);
      })
      .on('touchend', function() {
        clearTimeout(window.touchTimer);
      });


    $(".ft-name").on('touchstart', function(e) {
      window.touchTimer = setTimeout(function() {
        alert()
      }, 500);
    })

    .on('touchend', function() {
      clearTimeout(window.touchTimer);
    });


  }, 500);


  $(".ft-name").on('touchstart', function(e) {
      window.touchTimer = setTimeout(
        ft.doubleclick.call(e.target),
        500);
    })
    .on('touchend', function() {
      clearTimeout(window.touchTimer);
    });
    */
