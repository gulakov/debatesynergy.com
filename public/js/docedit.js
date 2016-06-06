
//window.off=true;
window.chunk=true;

function loadFile(id, callback) {


  //allow only one fileLoad at a time, break older if newer is started
  ft.ongoingXhrId = id;

  //don't reload same file
   if ( $("#doc-"+ft.selected.id).length && $("#doc-"+ft.selected.id).attr("id").substring(4) == id && ft.selected.id == id )
    return;

  //hide current doc
  //TODO partial
   $("#doc-"+ft.selected.id).hide() //.slideUp();

  //show selected doc if it's loaded before
  var prevDoc = $("#doc-" + id);
  if (prevDoc.length){
      prevDoc.show() //slideDown();
      ft.selected = prevDoc.data("info");

      $(".opened").removeClass("opened");
      $("#"+id).addClass('opened');

      if($("#"+id).hasClass("collapsed"))
        $("#"+id).parent().find(".ft-icon").click()

      if ( ft.selected){
        history.pushState(null, "", ft.selected.id);
        $("#select2-searchtext-container").html(ft.selected.title);
      }
      if (callback)
        callback();
      return;
  }



  $(".glyphicon-refresh").removeClass("glyphicon-refresh glyphicon-spin");
  $("#" + id + " ").prev().find(".ft-icon").addClass("glyphicon-refresh glyphicon-spin");

  $(".opened").removeClass("opened");



  ft.selected = {};


  $.ajax({
    xhr: function() {
      //download percentage as the download is in progress
      var xhr = new window.XMLHttpRequest();
      xhr.addEventListener("progress", function(evt) {





        if (evt.lengthComputable) {
          var percentComplete = Math.floor(evt.loaded / evt.total * 100);

        //  if (percentComplete > 5 && percentComplete < 30){
          //  var x = evt.target.response;
          //  x = x.substring(x.indexOf('"text"')+8);

            //  console.log(x)
            //  $("#doc-"+ft.selected.id).html(x);

            //  xhr.abort();



        //  if (!$(".loading-doc").length)
          //  $("#info").html('<span class="loading-doc"></span> <span class="glyphicon glyphicon-refresh glyphicon-spin"></span>');

          if (ft.ongoingXhrId == id){
            $("#"+id).parent().css("background",
              "linear-gradient(90deg, rgb(170, 207, 231) "+percentComplete+"%, transparent 0%)");

              $("#"+id).next().css("background-color","white");
          }else
            xhr.abort();

        }
      }, false);

      return xhr;
    },
    url: "/doc/read",
    data: {id: id, partial: window.preloadHeading},
    error: function(r) {
    if (r.responseText=="Access denied")
          alert('Access denied to file <b>' + id +  '</b>.' +
          (($("#filetree #"+id).length) ? ' Remove from file tree? <button data-dismiss="alert" class="btn btn-xs btn-primary">OK</button>':''),
          "failure", null, !$("#filetree #"+id).length )
              .on('click', ".btn-primary", function() {
                  if ($("#filetree #"+id).length){
                    $("#filetree #"+id).closest('.ft-item').remove();
                    return;
                  }
              })

    if (r.responseText == "Not found"){

      alert('File <b>' + id +  '</b> is not found.' + ($("#filetree #"+id).length ?
          ' Remove from file tree?' + ' <button data-dismiss="alert" class="btn btn-xs btn-primary">OK</button>' : ''),
          "failure", null, !$("#filetree #"+id).length)
            .on('click', ".btn-primary", function() {

                if ($("#filetree #"+id).length){
                  $("#filetree #"+id).closest('.ft-item').remove();
                }
            })


      return;
    }




  },
    success: function(r) {


      console.log(Date.now())




      //set as selected doc object and change URL without reloading apge
      ft.selected = r;
      ft.selected.id = ft.selected._id

      if (typeof history.pushState == "undefined") //ie9
        location.hash=ft.selected.id;
      else
        history.pushState(null, "", ft.selected.url);



      $("#"+ft.selected.id).addClass('opened').removeClass("collapsed");


      //show doc if not already loaded by the "show previously opened" check
        var docDivHTML = '<article class="doc" id="doc-'  +  ft.selected.id  + '" >';

        if (!document.querySelector("#doc-" + ft.selected.id)){

          if (window.chunk){

          //  var doc_div = $("").addClass("doc").attr("id", "doc-" + ) //.attr('fnteditable',true);

              var SIZE = 100000;
              chunk_len = Math.ceil((ft.selected.text.length+1)/SIZE);
          //    console.log( chunk_len)

              for (var i = 0 ; i < chunk_len; i++){

                 docDivHTML+= "<section contenteditable>"+ft.selected.text.substring(i*SIZE,(i+1)*SIZE)+"</section>"
                 //TODO break on headings

              }



            // doc_div.html(ft.selected.text)

          } else{

            var docDivHTML = '<div contenteditable class="doc" id="doc-'  +  ft.selected.id  + '" >';



            docDivHTML += ft.selected.text;


          }


          docDivHTML+="</article>"


          $(".doc").hide()



            docs.insertAdjacentHTML('beforeend',docDivHTML)

            // $('#doc-'  +  ft.selected.id )[0].style.display='block';


             //slideDown();


        }

        delete ft.selected.text;
        $("#doc-" + ft.selected.id).data("info", ft.selected);



      if($("#"+ft.selected.id).hasClass("collapsed"))
        $("#"+ft.selected.id).parent().find(".ft-icon").click()



      //add for public or shared files or files you removed from tree -- not in filetree
      if (!$('#' + ft.selected.id).length) {
        //setTimeout(function(){
          if (!u.index)
            u.index = [];

          u.index.push( {
            "id": ft.selected.id,
            "title": ft.selected.title,
            "type": "ft-file ft-selected"})

        //  if (u.index[0].id=="home")
        //    delete u.index[0];


          ft.populate($("#filetree"),u.index);
          //$("#showround").click()
      //  }, 1000);

      }




      if (callback) callback()
      //document.body.dispatchEvent(new CustomEvent("doc"));


      //put current doc title in the search box to improve clarity
      $("#select2-searchtext-container").html(ft.selected.title);


      //populate index with the new doc's headings


      ft.updateNeeded = true;
      setTimeout(ft.update, 2000); //TODO this will conflict overwrite a file thats fetched lcoally but has frinds updates on server

      //repopulate just this file


    }
  });


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
