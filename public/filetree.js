//TODO create parenting -- when you're dragging the headings  have arrow icon under
//collapsible heading levels and auto load which level
//dragging headigns into another documents

var ft = {
init: function(el, json) {

  ft.root = $(el);
  ft.dragging = false;
  ft.selected = {};

  //populate and events
  ft.populate(el, json);
  $("body").on("click", ".ft-icon", function(e){
    //clicking icon collapses sub-list
  /*
*/
  })
  .on("click", ".ft-rename", function(e){
    var ftName = $(this).closest('.ft-item').find('.ft-name:first');
    ftName.attr('contenteditable', true);
    ftName.focus();

  })
  .on("mouseup", ".ft-name", function(e){
    $(this).attr('contenteditable', true);
  })
  //clicking item handles the click, loads file
  .on("click", ".ft-item, .ft-name", ft.click)
  .on("mousedown", ".ft-item .select2", function(){

    //options dropdown shouldnt exit on select users
    $("body").on("hide.bs.dropdown", ".ft-options", function(e){ console.log(e)
     e.preventDefault();
    })
  })
  .on("blur", ".select2-search__field", function(){
    $("body").unbind("hide.bs.dropdown");
  })
  .on("click", ".ft-collapse", function(e){
    var ftName = $(this).closest('.ft-item').find('.ft-name:first');

    ftName.toggleClass('collapsed');
    var newIcon = "ft-icon glyphicon glyphicon-";

     newIcon += ftName.hasClass("file") ? ftName.hasClass('collapsed') ? 'plus' :  'file'
        : ftName.hasClass("folder") ? ftName.hasClass('collapsed') ?  'folder-close' :  'folder-open' : '';

        $(this).closest('.ft-item').find('.ft-icon').attr('class', newIcon);


  })
  .on("show.bs.dropdown", ".ft-options", function(e){


//$(e.relatedTarget).parent().find(".dropdown-menu").html( )

      $(".ft-share-specific").select2({
        ajax: {
          url: "/user/search",
          dataType: 'json',
          delay: 50,
          data: function (params) {
          return {userinfo: params.term};
          },
          processResults: function (data, params) {
            return {results: data.splice(0, u.name ? 5 : 0)}; //Login required to invite users
          },
          cache: true
          },
          minimumInputLength: 4,
          escapeMarkup: function (markup) { return markup; },

          maximumSelectionLength: 9,
          templateResult: function  (sel) {
            return sel.email ? u.name ? "<span><b>" +sel.text + "</b> " + sel.email + "</span>" : "Login required" : sel.text;
          }
          //data: finalList,

      })


    $(e.relatedTarget).parent().find('.sm0').before('<span class="ft-checkmark glyphicon glyphicon-ok">')





  })

  .on("click", ".ft-options > li", function(e){

    $(e).closest('.ft-item').find('.ft-name').addClass("ft-team")
    console.log(e)


  })


  .on("click", ".ft-delete", function(e){
    //delete button: for owner deletes file, for share & public removes from tree //TODO

    var id = $(this).closest('.ft-item').find('.ft-name:first').attr('id');

    if (!confirm("Are you sure you want to delete the file \"" + $(this).closest('.ft-item').find('.ft-name:first').text() + "\"?"))
      return;

    if (local)
      localStorage.removeItem("debate_" + id);
    else
      $.get("/doc/delete", {id: id});

    $(this).closest('.ft-item').remove();
    u.index=u.index.filter(function(i){return i.id!=id; });
    $("doc-"+id).remove();
    if(id == ft.selected.id)
      ft.selected = {};

    ft.updateIndex();


  })
  .on("keydown", ".ft-name", function(e){
    if(e.which==13){
      $(this).blur();
      e.preventDefault();
    }
  })
  .on("blur", ".ft-name", function(e){

      // update title: allowed for owner, share; disabled for public
      //if (u._id == ft.selected.userid || ft.selected.share && ft.selected.share.indexOf(u.email) > -1) {



    var newTitle = $(this).text(), id = $(this).attr('id');

    if (local) {
      var itemJSON = JSON.parse(localStorage["debate_"+id]);
      itemJSON.title = newTitle;
      localStorage["debate_"+id] = JSON.stringify( q);
    } else {
      $.post('/doc/update', {
        title: newTitle,
        id: id
      });
    }

    //alter index and upload it
    u.index=u.index.map(function(i){
      if (i.id==id)
        i.title = newTitle
      return i;
    });

    ft.updateIndex();

  })




  //update share user, only for owner
  //if (u._id == ft.selected.userid) {


    $(".ft-share")
      .on('focus', function() {
        if ('[emails], public, public edit' == $("#file-sharing").text())
          $("#file-sharing").empty();
      })
      .on('keydown', function(e) {

        if (e.keyCode != 13) return;
        e.preventDefault();

        var shareList = $("#file-sharing").text().split(',').map(function(i) {
          return i.trim();
        });
        $.post('/doc/update', {
          id: ft.selected.id,
          share: $("#file-sharing").val()
        }, function(r) {
          $("#file-sharing").val(r.join(", "));
          $("#file-sharing").addClass('btn-info');
          setTimeout(function() {
            $("#file-sharing").removeClass('btn-info');
          }, 1000)

        });


      })








  //update filetree and save every 5s
  setInterval(function() {
    if (typeof(MutationObserver) == "undefined")
      ft.updateNeeded = true;

    ft.update();
  }, 5000);

  //update triggered only when needed
  ft.updateNeeded = false;

  if (typeof MutationObserver != "undefined")
    new MutationObserver(function(m) {
      ft.updateNeeded = true;
    }).observe($("#docs")[0], {
      childList: true,
      subtree: true
    });

  $("#docs").keyup(function(e){
    ft.updateNeeded = true;
    if ($(window.getSelection().anchorNode).closest("h1,h2,h3").length)
      ft.update();

  })


  //click last selected (or first) on first-load
  window.setTimeout(function() {
      if ($('.ft-selected').length)
        $('.ft-selected').click();
      else
        $('.ft-item:first').click();
  }, 1000);



  //drag and rearrange file order
  $('#filetree').on("dragstart", function(e) {
      ft.dragging = $(e.target).closest('.ft-item');

      $(e.target).addClass("ft-being-dragged");
    })
  $(document).on("dragover", function(e) {
      e.preventDefault();
    })
    .on("dragenter", function(e) {
      e = $(e.target).closest('.ft-item');
      if (e)
        e.addClass("ft-dragged-over")
    })
    .on("dragleave", function(e) {
      e = $(e.target).closest('.ft-item');
      if (e)
        e.removeClass("ft-dragged-over")
    })
    .on("drop", function(e) {
      //this event is doubled by the "drop docx upload" so if file dropped cancel event
      if (e.originalEvent.dataTransfer && e.originalEvent.dataTransfer.files.length) return;

      // prevent default action
      e.preventDefault();
      //ft-item receiving the drop
      var dropItem = $(e.target).closest(".ft-item");

      if (dropItem.length){
        var dropClass = dropItem.find(".ft-name").attr('class').match(/(file|folder|heading)/gi);
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
      } else if (ft.dragging.find(".ft-name").hasClass("folder") || ft.dragging.find(".ft-name").hasClass("file")) {

        if (dropClass=="folder" && e.originalEvent.clientX > 30) { //dropping on folder makes it a child if over px from left
          if (!dropItem.find('.ft-list').length)
            dropItem.append("<div class='ft-list'>")

          dropItem.find('.ft-list').append(ft.dragging);

        } else if (dropClass=="folder" || dropClass=="file") {

          dropItem.after(ft.dragging);
        } else //don't allow others
          return;


      //headings: dropped onto files (child) or headings (next)
      } else if (ft.dragging.find(".ft-name").hasClass("heading")) {

        if (dropClass=="file") {
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
        var headList = $(".doc:visible").find("h1,h2,h3");
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







},

loadFile: function(id, headingId) {

  //allow only one fileLoad at a time, break older if newer is started
  ft.ongoingXhrId = id;

  //don't reload same file
  if ( $(".doc:visible").length && $(".doc:visible").attr("id").substring(4) == id && ft.selected.id == id )
    return;

  //hide current doc
  $(".doc:visible").slideUp();

  //show selected doc if it's
  if ($("#doc-" + id).length)
    $("#doc-" + id).slideDown();


  function onScroll(){
      // on scroll, update selected header index
    $(".doc:visible").on("scroll",  function(e) {

      var list = $(".doc:visible").find("h1, h2, h3");

      for (var i = 0; i < list.length; i++)
        if (list[i].textContent.length > 2 && list[i].getBoundingClientRect().bottom > 300)
          break;

      $(".ft-selected").removeClass("ft-selected");
      $("#" + ft.selected.id + "_" + i).parent().prev().addClass("ft-selected");

      if (i == list.length)
        $("#" + ft.selected.id).next().children().last().find('.ft-name').addClass("ft-selected");

      if ($(".ft-selected")[0] && document.body.scrollIntoViewIfNeeded)
        $(".ft-selected")[0].scrollIntoViewIfNeeded();

    });

  }

  onScroll();



    $(".glyphicon-refresh").removeClass("glyphicon-refresh glyphicon-spin");
    $("#" + id + " ").prev().find(".ft-icon").addClass("glyphicon-refresh glyphicon-spin");



 $(".ft-visible").removeClass("ft-visible");

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
            //  $(".doc:visible").html(x);

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
    data: {id: id},
    error: function(r) {
      if (r.responseText=="Access denied")
        setTimeout(function(){

          $(".glyphicon-refresh").removeClass("glyphicon-refresh glyphicon-spin");

          if (r == "Not found" && confirm("Access denied to file id " + id + ". Remove from file tree?")) {
            $(".ft-selected").closest('.ft-item').remove();
            return;
          }


        }, 1000);
    },
    success: function(r) {

      $(".glyphicon-refresh").removeClass("glyphicon-refresh glyphicon-spin");



      if (r == "Not found" && confirm("File id " + id + " is not found. Remove from file tree?")) {
        $(".ft-selected").closest('.ft-item').remove();
        return;
      }


      $("#"+id).parent().css("background", "").addClass('ft-visible');


      //set as selected doc object and change URL without reloading apge
      ft.selected = r;
      history.pushState(null, "", ft.selected.id);

      //add for public or shared files -- not in filetree
      if (!$('#' + id).length) {
        u.index.push( {
          "id": ft.selected.id,
          "title": ft.selected.title,
          "type": "file ft-selected public"})

        if (u.index[0].id=="home")
          delete u.index[0];


        ft.populate($("#filetree"),u.index);

      }


      //show doc if not already loaded by the "show previously opened" check
      if (!$("#doc-" + r.id).length){
        $("<div>").addClass("doc").attr("id", "doc-" + ft.selected.id).attr("contenteditable", true).html(ft.selected.text).appendTo("#docs").slideDown();

        onScroll();
      }




      //scroll to heading if triggered by click on heading within this doc
      if (headingId)
        $(".doc:visible").find("h1, h2, h3")[headingId].scrollIntoView();


      //populate index with the new doc's headings
      ft.updateNeeded = true;
      ft.update();



    }
  });


},


populate: function(div, json) {

  if (div[0].id == ft.root[0].id){
    div.empty();
  }else{
    div.append('<div class="ft-list">');
    div = div.find('.ft-list');
  }

  for (var i in json) {
    //TODO author/share tooltip info // date crated/ added

    var item = json[i].type.indexOf("heading")>-1 ?
      $('<div class="ft-item' + (json[i].type.indexOf("selected")>-1 ? ' ft-selected' : '') + '" draggable="true" ><span  id="' + json[i].id + '" class="ft-name ' +
        json[i].type + '" title="' + json[i].title + '" >' + json[i].title + '</span> </div>')
      : $('<div class="ft-item" draggable="true"><div class="ft-options btn-group-xs">'+

        '<span  data-toggle="dropdown" aria-haspopup="true" aria-expanded="true" class="ft-icon glyphicon glyphicon-' +  (
              json[i].type.indexOf("file")>-1 ? json[i].type.indexOf("collapsed")>-1 ? 'plus' :  'file'
               : json[i].type.indexOf("folder")>-1 ?  json[i].type.indexOf("collapsed")>-1 ? 'folder-close' :  'folder-open'
              : "" ) + " " + ( json[i].type.indexOf("public")>-1 ? ' ft-public ' : "") + '" ></span>'+

        '<ul class="dropdown-menu dropdown-menu-right"><li> <a class="ft-collapse">Collapse / Expand</a></li>  <li> <a class="ft-delete">Delete</a></li> <li> <a class="ft-rename">Rename</a></li><li class="dropdown-header">SHARE</li>'+
        '<li> <a class="ft-share-team">Team</a></li><li><a class="ft-share-public">Public</a></li><li><a class="ft-share-publicedit">Public Edit</a></li> '+
        '<li> <select class="ft-share-specific" style="width: 100%"   multiple="multiple" type="text"></select></li>   </ul></div>'+


        '<span  id="' + json[i].id + '" class="ft-name ' + json[i].type.replace("ft-selected","") + '"  >' + json[i].title + '</span> '+


          '</div>');


    item.appendTo(div)

    if (json[i].children && json[i].children.length)
      ft.populate(item, json[i].children);

  }

},

toJSON: function(startLevel) {
  if (typeof startLevel == 'undefined')
    startLevel = $("#filetree");

  var array = [];
  startLevel.children('.ft-item').each(function() {
    var itemName = $(this).find('.ft-name')[0];
    var item = {
      id: itemName.id,
      title: itemName.textContent,
      type: itemName.className.replace(/ft-name/gi, '').trim()
    };

    item.type += $(this).hasClass("ft-selected") ? " ft-selected" : "";



    var sub = $(this).children('.ft-list');
    if (sub.length)
      item.children = ft.toJSON(sub);
    array.push(item);
  });

  return array;

},

//upload tree index to server
updateIndex: function() {

  if (local) {
    localStorage.debate = JSON.stringify(u.index);

    ft.selected.text = $(".doc:visible").html().replace(/\'/g, '&#39;');
    localStorage["debate_" + ft.selected.id] = JSON.stringify(ft.selected);
  } else if (u.index.length)  //upload user as object to POST
    $.ajax({
        url: '/user/update',
        data: u,
        contentType: "application/x-www-form-urlencoded",
        type: 'POST'
    });

},

//save doc to server, update headings into index
update: function() {

  u.index = ft.toJSON();

  //find the headings
  if (ft.selected && $(".doc:visible").length && ft.updateNeeded && ft.selected.id == $(".doc:visible").attr('id').substring(4) ){
    var headingList = [],  i = 0,  selectedId = -1;

    if ($(".ft-selected .ft-name").hasClass("heading"))
      selectedId = parseInt($(".ft-selected .ft-name").attr("id").substring($(".ft-selected .ft-name").attr("id").indexOf("_") + 1))


    $(".doc:visible").find("h1, h2, h3").each(function() {

      if ($(this).text().length > 2) {
        headingList.push({
          'id': ft.selected.id + "_" + i.toString(),
          'title': $(this).text().substring(0, 50),
          'type': 'heading ' + 'heading-' + $(this).prop("tagName").toLowerCase() + (selectedId == i ? " ft-selected" : "")
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



  	//backup for offline cache
  	localStorage.debate = JSON.stringify(u.index);
    localStorage["debate_" + ft.selected.id] = JSON.stringify(ft.selected);




    //recreate index -- but only for the current doc to update its headings
    $("#"+ ft.selected.id).parent().find(".ft-list").remove()
    ft.populate( $("#"+ ft.selected.id).parent(), headingList);

    //upload doc
    $.post('/doc/update', {
      text: encodeURIComponent($(".doc:visible").html()),
      id: ft.selected.id
    });

    //5s counter
    ft.updateNeeded = false;
  }

  //save indexJSON
  ft.updateIndex();

},

//click on ft-name event or pass the id to click
click: function(e) {
  e = typeof e == "string" ? $("#" + e) : $(e.target).hasClass('ft-name') ? $(e.target) : $(e.target).find('.ft-name:first');

  var id = e.attr('id');
  var headingId = false;


  //TODO loading file inderectly or always showign the file name selected even as headers change
  $('.ft-selected').removeClass('ft-selected');
  e.parent().addClass('ft-selected');





  if (e.hasClass("heading")) {

    headingId = parseInt(id.substring(id.indexOf("_") + 1));
    id = id.substring(0, id.indexOf("_"));

    if (ft.selected.id == id && $(".doc:visible").attr('id').replace("doc-", '') == id)
      $(".doc:visible").find("h1, h2, h3")[headingId].scrollIntoView();
    else //if clicked on header in unopened file, load that file, then go to header
      ft.loadFile(id, headingId);

  	$(".doc:visible").scrollTop($(".doc:visible").scrollTop() - 260);



  } else if (e.hasClass("file")) {

    if (!u.name) { //SPECIAL PAGE: guest user welcome screen

      ft.selected = u.index.filter(function(i) {
        return id == i.id;
      })[0];

      if ($("#doc-" + id).length)
        $("#doc-" + id).slideDown()

      location.hash = id;

    } else if (local) {

        ft.selected = JSON.parse(localStorage["debate_" + id]);


        //hide current doc
        $(".doc:visible").hide();

        //show selected doc if it's already loaded
        if ($("#doc-" + id).length)
          $("#doc-" + id).show()
        else // load doc from localStorage
          $("<div>").addClass("doc").attr("id", "doc-" + ft.selected.id).attr("contenteditable", true)
          .appendTo("#docs").html(ft.selected.text);


        //populate index with the new doc's headings
        ft.updateNeeded = true;
        ft.update();

        //location.hash = ft.selected.id;
        //history.pushState(null, "", ft.selected.id);



    } else //load file when clicked on filetitle
      ft.loadFile(id);


  } else if (e.hasClass("folder")) {

    //TODO
    //  $(".doc").hide();
    //ft.selected = {};

  }

},

dblclick: function() {

  if ($(this).hasClass("heading")) {

    var id = $(this).attr('id');

    var headingId = parseInt(id.substring(id.indexOf("_") + 1));
    id = id.substring(0, id.indexOf("_"));


    var headingList = $(".doc:visible").find("h1, h2, h3");

    var endNode = headingId == headingList.length - 1 ? $("#docs>p:last")[0] : headingList[headingId + 1];


    range = document.createRange();
    range.setStart(headingList[headingId], 0);
    range.setEnd(endNode, 0);
    sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

  }

  if (!$(this).hasClass("file") && !$(this).hasClass("folder"))
    return;
  //TODO what should dblclick/ longtouch on file titles do?

},


};
