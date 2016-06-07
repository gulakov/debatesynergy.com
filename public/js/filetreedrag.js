

$(document).ready(function(){

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
  });
