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


    //fisheye


    $("#filetree").mousemove(function(e){

        clearTimeout(window.fisheye)
        // filetree.style.cursor="initial"

        window.fisheye = setTimeout(function(){

            if (e.originalEvent.clientY>filetree.getBoundingClientRect().bottom-30){
              filetree.scrollTop+=15
              filetree.style.cursor="s-resize"
            } else  if (e.originalEvent.clientY<filetree.getBoundingClientRect().top+20){
              filetree.scrollTop-=15
              filetree.style.cursor="n-resize"
            } else{
              filetree.style.cursor="initial"

            }

        },50)

    }).mouseleave(function(e){

              clearTimeout(window.fisheye)

    })



  //
  //
  // $("body").on("scroll", ".docs", function(){
  //   clearTimeout(window.scrollThrottle);
  //   window.scrollThrottle = setTimeout(navScrollHeading, 500)
  //
  // });


  //
  //
  //
  // //update filetree and save every 5s
  // setInterval(function() {
  //  // if (typeof(MutationObserver) == "undefined")
  //   //  ft.updateNeeded = true;
  //
  //   ft.update();
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




},

/*
<ul draggable class="open current" id="ft-55b6077b4453ea391da4317f">
  <label>Hegemony Good</label>
  <li draggable class="h1 selected">Soft Power 2ac-links</li>
  <li draggable class="h1">Soft PO BAd</li>
</ul>


<ul class="open current" id="ft-securityk">
  <label>Hegemony Good</label>
  <li class="h1 selected">Soft Power 2ac-links</li>
  <li class="h1">Soft PO BAd</li>
</ul>


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

        if (!item.children && item.type=="file")
          item.type="file collapsed";


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


  // debugger
  $(startLevel).children('ul,li').each(function(){
    var nav = $(this);

    var item = {
      id: nav.attr("id"),
      title: nav.children('label').text(),
      type: nav.attr("class")
    };


    var subNavs = nav.find('li');
    if (subNavs.length)
      item.children = ft.toJSON(nav);

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

    //console.log(headingList);

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

  //save ft html to fast-pull from local

  // localStorage.index = filetree.innerHTML;

  // document.cookie = 'index_updated='+Date.now()+'; expires=Fri, 18 Nov 2020 20:20:20 UTC; path=/'


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

    console.log(headingId)



    function scrollToHeading(){


            var headList = $("#doc-"+ft.selected.id).find("h1, h2, h3");

            for (var i=0; i < headList.length ; i++)
                if( headList[i].textContent.length < 3)
                  headList.splice(i--,1);
                else if( i == headingId)
                  break;


       headList[i].scrollIntoView();  //TODO inexact!!
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
