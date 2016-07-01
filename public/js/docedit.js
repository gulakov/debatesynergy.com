
  // on scroll, highlight currently-viewed block in nav filetree
  function navScrollHeading(){

      // var elem = document.elementFromPoint(filetree.offsetWidth+20,
      //       filetree.getBoundingClientRect().top  + filetree.clientHeight*.2 + 30);
      //
      //       // debugger
      // var closestHead = $(elem).closest("section>*").eq(0).prevUntil("h1,h2,h3").last().prev()
      //
      // console.log(closestHead);


      var headList = $("#doc-"+ft.selected.id).find("h1, h2, h3");

      for (var i=0; i < headList.length ; i++)
          if( headList[i].textContent.length < 3)
            headList.splice(i--,1);
          else if( headList[i].getBoundingClientRect().top > 100)
            break;


        $(".selected").removeClass("selected");
        $("#" + ft.selected.id).find("li").eq(i-1).addClass("selected");


        // if (i == headList.length)
        //   $("#" + ft.selected.id).next().children().last().find('.ft-name').addClass("ft-selected");

        // if ($(".selected")[0]) // && document.body.scrollIntoViewIfNeeded)
        //   $(".selected")[0].scrollIntoViewIfNeeded();


      if ($(".selected")[0]){
        $(".selected")[0].scrollIntoView();
      //  if ( $(".ft-selected").offset().top < window.innerHeight/2)
          $("#filetree")[0].scrollTop -= filetree.clientHeight*.2

       // $("#filetree")[0].scrollTop = $(".ft-selected").position().top-window.innerHeight/2+75
      }

    }



function pasteHtmlAtCaret(html) {
    sel = getSelection()
    range = sel.getRangeAt(0);
    range.deleteContents();

    el = range.createContextualFragment(html)
    var frag = document.createDocumentFragment(), node, lastNode;
    while ( (node = el.firstChild) ) {
        lastNode = frag.appendChild(node);
    }
    var firstNode = frag.firstChild;
    range.insertNode(frag);

    // Preserve the selection
    if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.setStartBefore(firstNode);

        sel.removeAllRanges();
        sel.addRange(range);
    }

}




//EDITOR PASTE SPECIAL -- paste plain text except debate formatting
//TODO it's all bold if ur in bold place >> smart unformatting
$(window)[0].addEventListener("paste", function(e) { return;
    //disable default paste
    e.preventDefault();


    var data =  e.clipboardData.getData("text/html") || e.clipboardData.getData("text/plain");

    console.log(data);

    data = data.replace(/<u([^>]+)>/gi, 'UNDERLINE_START').replace(/<\/u>/gi, 'UNDERLINE_END')
    data = data.replace(/<b([^>]+)>/gi, 'BOLD_START').replace(/<\/b>/gi, 'BOLD_END')
    data = data.replace(/<p([^>]+)>/gi, 'P_START').replace(/<\/p>/gi, 'P_END')

    //remove html tags
    data=data.replace(/(<([^>]+)>)/ig,'')

    //save debate formatting
    data=data.replace(/P_START/gi, '<p>').replace(/P_END/gi, '</p>')
    data=data.replace(/BOLD_START/gi, '<b>').replace(/BOLD_END/gi, '</b>')
    data=data.replace(/UNDERLINE_START/gi, '<u>').replace(/UNDERLINE_END/gi, '</u>')

    //TODO make sure we're not in P

    var r = getSelection().getRangeAt(0);
    r.insertNode(r.createContextualFragment(data));
    //collapse to end
    getSelection().removeAllRanges();
    getSelection().addRange(r);
    getSelection().collapseToEnd()

}, true);


/*

//CARD SELECT - click to select whole card and normalize its font size
$("#docs, .speech").on("click", ".doc>*,p,h4,div", function(e) {

  var p = $(e.target).closest("p, h4, .doc>*");
  p.focus()
  $(".active-card").removeClass("active-card")
  p.addClass("active-card")

  //select whole card on triple click
  if (e.originalEvent.detail!=3)
    return;

  e.preventDefault();
  e.stopPropagation();

  e = $(e.target);
  var p = e.closest("p, h4");



  //TODO fix card selection algo
  function type(p) {
    var u = p.find("u").length;
    var b = p.find("b").length;
    var a = p.contents().length;



        if (!b && !u)
          return 0;
        else if (u > 1 || a > 4)
          return 3;
        else if (p[0] && p[0].nodeName == "OL" || p[0].nodeName == "H4")
          return 1;

        else if (b == 1 && a < 2)
          return 1;
        else if (b < a)
          return 2;

    }

    start = p;
    if (type(p) == 1)
      start = p;
    else if (type(p.prev()) == 1)
      start = p.prev();
    else if (type(p.prev().prev()) == 1)
      start = p.prev().prev();
    else if (type(p.prev().prev().prev()) == 1)
      start = p.prev().prev().prev();

    p = start.next().next();
    if (!start.next().text().length || !p.text().length)
      p = p.next();
    end = p;
    if (type(p) == 3)
      end = p;
    else if (type(p.next()) == 3)
      end = p.next();
    else if (type(p.next().next()) == 3)
      end = p.next().next();


    range = document.createRange();
    range.setStart(start[0], 0);
    range.setEnd(end[0], end[0].childNodes ? end[0].childNodes.length : end[0].length);
    sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

})


*/
