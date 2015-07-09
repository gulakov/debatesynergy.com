//TODO create parenting -- when you're dragging the headings and have an icon for it
//collapsible headign levels and auto load which level
//dragging headigns into another documents

var ft = {
init: function(el, json) {

  ft.root = $(el);
  ft.populate(el, json);

  ft.dragging = false;
  ft.selected = {};


  //update filetree and save every 10s
  setInterval(function() {
    if (typeof(MutationObserver) == "undefined")
      ft.uploadNeeded = true;

    ft.update();
  }, 10000);

  //update triggered only when needed
  ft.uploadNeeded = false;

  if (typeof(MutationObserver) != "undefined")
    new MutationObserver(function(m) {
      console.log(m);
      ft.uploadNeeded = true;
    }).observe($("#docs")[0], {
      childList: true,
      subtree: true
    });


  //click selected on init
  window.setTimeout(function() {
    if ($('.ft-selected').length)
      $('.ft-selected').click();
      else
        $('.ft-name:first').click();
  }, 500);



  //drag and rearrange file order
  $('#filetree').on("dragstart", function(e) {
      ft.dragging = $(e.target).closest('.ft-item');

      $(e.target).addClass("ft-being-dragged");
    })
    .on("dragend", function(e) {
      // $(e.target).removeClass("ft-being-dragged");
    });
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

        if (dropClass=="folder" && e.originalEvent.clientX > 150) { //child margin
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

      ft.uploadNeeded = true;
      ft.update();
    });


  //long touch on mobile
  setTimeout(function() {
    $('.ft-name')
      .on('click', ft.click)
      .on('dblclick', ft.dblclick)
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

  $('.ft-name')
    .on('click', ft.click)




  // on scroll, update selected header index
  document.getElementById("docs").addEventListener("scroll", function() {
    var list = $(".doc:visible").find("h1, h2, h3");

    for (var i = 0; i < list.length; i++)
      if (list[i].textContent.length > 2 && list[i].getBoundingClientRect().bottom > 300)
        break;

    $(".ft-selected").removeClass("ft-selected");
    $("#" + ft.selected.id + "_" + i).parent().prev().find('.ft-name').addClass("ft-selected");

    if (i == list.length)
      $("#" + ft.selected.id).next().children().last().find('.ft-name').addClass("ft-selected");

    if ($(".ft-selected")[0] && document.body.scrollIntoViewIfNeeded)
      $(".ft-selected")[0].scrollIntoViewIfNeeded();

  }, true);




},


populate: function(div, json) {

  if (div[0].id == ft.root[0].id)
    div.empty();


  div.append('<div class="ft-list">')

  div = div.find('.ft-list');


  for (var i in json) {

    var item = $('<div class="ft-item" draggable="true"><div  id="' + json[i].id + '" class="ft-name ' +
      json[i].type + '" tooltip="' + json[i].title + '">' + json[i].title + '</div> </div>');
    item.appendTo(div)

    if (json[i].children && json[i].children.length) {

      item.find('.ft-name').prepend('<input  type="submit" value="+-">')
        .find('input').click(function(e) {
          $(e.target).closest('.ft-name').toggleClass("collapsed");
          if ($(this).val() == '+-')
            $(this).val('-')
          else
            $(this).val('+-')
        });


      ft.populate(item, json[i].children);
    }
  }

},

toJSON: function(startLevel) {
  if (typeof startLevel === 'undefined')
    startLevel = $("#filetree .ft-list:first");

  var array = [];
  startLevel.children('.ft-item').each(function() {
    var itemName = $(this).find('.ft-name')[0];
    var item = {
      id: itemName.id,
      title: itemName.textContent,
      type: itemName.className.replace(/ft-name/gi, '').trim()
    };



    var sub = $(this).find('.ft-list:first');
    if (sub.length)
      item.children = ft.toJSON(sub);
    array.push(item);
  });

  return array;

},

update: function() {
  //if is editting a name
  if (!$(".doc:visible").length)
    return;

  var treeJSON = ft.toJSON();


  //find the headings
  if (ft.uploadNeeded) {
    var headingList = [],
      i = 0,
      selectedId = -1;


    if ($(".ft-selected").hasClass("heading"))
      selectedId = parseInt($(".ft-selected").attr("id").substring($(".ft-selected").attr("id").indexOf("_") + 1))


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




    //add headings as children of current file
    for (var i in treeJSON)
      if (ft.selected && treeJSON[i].id == ft.selected.id && $(".doc:visible").attr("id").substring(4) == ft.selected.id)
        treeJSON[i].children = headingList;

  }

  u.index = treeJSON;



  //update db
  if (local) {
    localStorage.debate = JSON.stringify(u.index);

    ft.selected.text = $(".doc:visible").html().replace(/\'/g, '&#39;');
    localStorage["debate_" + ft.selected.id] = JSON.stringify(ft.selected);
  } else {
    if (u.index.length)
      $.post('/user/update', {
        index: JSON.stringify(u.index)
      });
    //  ft.selected.id == location.hash.replace("#",'')

    if (ft.selected && ft.uploadNeeded && ft.selected.id == $(".doc:visible").attr('id').replace("doc-", '')) {
      ft.uploadNeeded = false;

      $.post('/doc/update', {
        text: encodeURIComponent($(".doc:visible").html().replace(/\'/g, '&#39;')),
        id: ft.selected.id
      });
    }
  }


  ft.populate(ft.root, u.index);

  $('.ft-name').on('click', ft.click);

  $('.ft-name').on('dblclick', ft.dblclick);

},

loadFile: function(id, headingId) {

  //allow only one fileLoad at a time, break older if newer is started
  ft.ongoingXhrId = id;

  //hide current doc
  $(".doc:visible").slideUp();

  //show selected doc if it's
  if ($("#doc-" + id).length) {
    ft.selected = {};
    $("#doc-" + id).slideDown()
  }


  $.ajax({
    xhr: function() {
      //download percentage as the download is in progress
      var xhr = new window.XMLHttpRequest();
      xhr.addEventListener("progress", function(evt) {




        if (evt.lengthComputable) {
          var percentComplete = Math.floor(evt.loaded / evt.total * 100);

          if (percentComplete > 5 && percentComplete < 30){
          //  var x = evt.target.response;
          //  x = x.substring(x.indexOf('"text"')+8);

            //  console.log(x)
            //  $(".doc:visible").html(x);

            //  xhr.abort();
          }

          if (!$(".loading-doc").length)
            $("#info").html('<span class="loading-doc"></span> <span class="glyphicon glyphicon-refresh glyphicon-spin"></span>');

          if (ft.ongoingXhrId == id)
            $(".loading-doc").html(percentComplete + "%");
          else
            xhr.abort();

        }
      }, false);

      return xhr;
    },
    url: "/doc/read",
    data: {
      id: id
    },
    success: function(r) {

      if (r == "Not found" && confirm("File id " + id + " is not found. Remove from file tree?")) {
        $(".ft-selected").closest('.ft-item').remove();
        ft.selected = {};
        return;
      }


      ft.selected = r;

      //*** CREATE INFO PANEL
      $("#info").html("<span style='display:inline-block' id='file-current-title'>" + ft.selected.title + "</span>")

      // update title: allowed for owner, share; disabled for public
      if (u._id == ft.selected.userid || ft.selected.share.indexOf(u.email) > -1) {

        $("#file-current-title").attr('contenteditable', true);

        $("#file-current-title").on('keydown', function(e) {

          if (e.keyCode != 13) return;
          e.preventDefault();

          var fileTitle = $(this).text();

          $("#" + ft.selected.id).html(fileTitle);

          if (local) {
            ft.selected.title = fileTitle;
            localStorage["debate_" + ft.selected.id] = JSON.stringify(ft.selected);
          } else {
            $.post('/doc/update', {
              title: fileTitle,
              id: ft.selected.id
            });
          }

          ft.updateNeeded = true;
          ft.update();

        });

      }


      //delete button: for owner deletes file, for share & public removes from tree

      $("#info").append('<button id="aboutfile-delete" style="float:right;margin-top: -20px; display:inline-block" class="btn  btn-xs  btn-default glyphicon glyphicon-remove" data-toggle="tooltip" data-placement="bottom" title=""></button>')

      $("#aboutfile-delete").click(function() {
        if (u._id == ft.selected.userid) { //if owner of this doc
          if (!confirm("Are you sure you want to delete the file \"" + ft.selected.title + "\"?"))
            return;

          if (local)
            localStorage.removeItem("debate_" + ft.selected.id);
          else
            $.get("/doc/delete", {
              id: ft.selected.id
            });


        } else { // shared user of this doc
          if (!confirm("The original file owner will retain this file. Are you sure you want to remove \"" + ft.selected.title + "\" from your file tree?"))
            return;

          //remove user from Doc.share
        }

        $("#" + ft.selected.id).closest('.ft-item').remove();

        ft.updateNeeded = true;
        ft.update();


      });


      //update share user, only for owner
      if (u._id == ft.selected.userid) {

        $("#info").append("<div id='file-share-container'>Share:</span><span style='display: initial; width:100%;' id='file-sharing' contenteditable='true'>[emails], public, public edit</span></div>");

        if (ft.selected.share.length)
          $("#file-sharing").val(ft.selected.share.join(", "))


        $("#file-sharing")
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

      }





      //show doc if not already loaded by the "show previously opened" check
      if (!$("#doc-" + r.id).length){
        $("<div>").addClass("doc").attr("id", "doc-" + ft.selected.id).attr("contenteditable", true)
        .appendTo("#docs").html(ft.selected.text).slideDown();


        ft.updateNeeded = true;
        ft.update();



        history.pushState(null, "", ft.selected.id);
      }

      if (headingId)
        $(".doc:visible").find("h1, h2, h3")[headingId].scrollIntoView();


    }
  });


},


click: function(e) {
  e = typeof e == "string" ? $("#" + e) : $(e.target);

  var id = e.attr('id');
  var headingId = false;


  //TODO loading file inderectly or always showign the file name selected even as headers change
  $('.ft-selected').removeClass('ft-selected');
  e.closest('.ft-name').addClass('ft-selected');




  if (e.hasClass("heading")) {

    headingId = parseInt(id.substring(id.indexOf("_") + 1));
    id = id.substring(0, id.indexOf("_"));

    if (ft.selected.id == id && $(".doc:visible").attr('id').replace("doc-", '') == id)
      $(".doc:visible").find("h1, h2, h3")[headingId].scrollIntoView();
    else //if clicked on header in unopened file, load that file, then go to header
      ft.loadFile(id, headingId);



  } else if (e.hasClass("file")) {

    if (!u.name) { //SPECIAL PAGE: guest user welcome screen

      ft.selected = u.index.filter(function(i) {
        return id == i.id;
      })[0];

      if ($("#doc-" + id).length)
        $("#doc-" + id).slideDown()

      ft.update();
      location.hash = id;

    } else if (local) {

        ft.selected = JSON.parse(localStorage["debate_" + id]);


        //hide current doc
        $(".doc:visible").slideUp();

        //show selected doc if it's
        if ($("#doc-" + id).length) {
          ft.selected = {};
          $("#doc-" + id).slideDown()
        }

        //show doc
        if (!$("#doc-" + r.id).length)
          $("<div>").addClass("doc").attr("id", "doc-" + ft.selected.id).attr("contenteditable", true)
          .appendTo("#docs").html(ft.selected.text).hide().slideDown();


        ft.updateNeeded = true;
        ft.update();


        history.pushState(null, "", ft.selected.id);



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

    var endNode = headingId == headingList.length - 1 ? $("#editor>p:last")[0] : headingList[headingId + 1];


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
