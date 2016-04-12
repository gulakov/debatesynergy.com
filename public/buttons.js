$(document).ready(function() {

  //SIDEBAR BUTTONS

  $('button').tooltip();


  //file info modal -- init
  $("#showfileinfo").click(function() {

    if (!ft.selected.id) {
      alert("Select a file to view its information.");
      return;
    }



    $("#file-info-modal").modal('show');


    $("#file-info-title").text(ft.selected.title)
    // if file is shared with you
    if (ft.selected.userid != u._id) {
      $.getJSON("/user/" + ft.selected.userid, function(r) {

        $("#file-info-owner").text(r.name + " (" + r.email + ")")
      })

      $("#file-share-by-owner").remove()

      //remove as collaborator

    } else {



      //if you are owner of this file
      $("#file-info-owner").text("me")

      $("#file-info-title").attr("contenteditable","true")


      //share
      var share_id = 0;
      if (ft.selected.share == "team") share_id = 1
      if (ft.selected.share == "public") share_id = 2
      if (ft.selected.share == "specific") share_id = 3
      $(".radio-share").eq(share_id).attr('checked', 'checked');


      //prepop shareusers
      $('#share-select').empty()
      for (var i in ft.selected.shareusers)
        $('#share-select').append("<option value='"+ft.selected.shareusers[i].id+"' selected>"+ft.selected.shareusers[i].text+"</option>");


      $('#share-select').trigger('change');


    }


  });





$('#share-select').select2({
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






  //file info modal - delete button: for owner deletes file, for share & public removes from tree
  $(".ft-delete").click(function() {
    var id = ft.selected.id;

    if (ft.selected.userid != u._id) {
      if (!confirm("Are you sure you want to remove yourself as a shared collaborator of the file \"" + ft.selected.title + "\"?"))
        return;

          $.post('/doc/update', {
            id: ft.selected.id,
            shareusers_remove_me: true
          })

    } else {
      if (!confirm("Are you sure you want to delete the file \"" + ft.selected.title + "\"" + (ft.selected.share ? " from yourself and all shared users" : "") + "?"))
        return;

      $.get("/doc/delete", {
        id: id
      });
    }

    //TODO chrome.storage

    $("#" + id).closest('.ft-item').remove();
    u.index = u.index.filter(function(i) {
      return i.id != id;
    });
    $("#doc-" + id).remove();
    ft.selected = {};
    ft.updateIndex();


    $("#file-info-modal").modal('hide');
  })


  //file info modal -- save title, sharing
  $("#file-info-modal-submit").click(function(){

        $.post('/doc/update', {
          id: ft.selected.id,
          title: $("#file-info-title").val(),
          share: $(".radio-share:checked")[0].id.substring(6),
          shareusers:  $('#share-select').select2("data").map(function(i){ return {id:i.id,  text:i.text}; })
        })
        //TODO chrome.storage

        //change share color in filetree
        $("#" + ft.selected.id).closest('.ft-item').addClass($(".radio-share:checked")[0].id.substring(6))


          $("#file-info-modal").modal('hide');

  })










  $("#showsettings").click(function() {

    /*if (u.debatetype == 1)
        $(".debatetype")[0].checked = true;
    if (u.debatetype == 2)
        $(".debatetype")[1].checked = true;

    $("#teamname").val(u.teamname);
    */

    $("#custom-css").val(u.custom_css);
    $("#custom-js").val(u.custom_js);

    $("#settings").modal('show');

    setTimeout(function() {
      $("#filename").focus();
    }, 500)

  });




  $('#settings_save').click(function() {

    $.post("/user/update", {
      // debatetype: $(".debatetype:checked").val(),
      // teamname: $("#teamname").val(),
      custom_css: encodeURIComponent($("#custom-css").val()),
      custom_js: encodeURIComponent($("#custom-js").val())
    }, function() {
      location.reload();
    });

    $("#settings").modal('hide');

  });

  $('#settings_logout').click(function() {
    document.location.pathname = '/auth/logout';
  });


  $("#import_googledrive").click(function() {

    var filePickerResponse = function(pickedFilesData) {

      if (pickedFilesData.action != "picked") return;

      gapi.client.drive.files.get({
        'fileId': pickedFilesData.docs[0].id
      }).execute(function(resp) {
        $.ajax({
          url: resp.exportLinks["text/html"],
          type: 'GET',
          beforeSend: function(xhr) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
          },
          data: {},
          success: function(fileHtml) {

            //create new!!

            $(".doc:visible").html(fileHtml)


            setTimeout(function() {

              $(".doc:visible *").each(function() {

                if ($(this).css('font-weight') == 'bold')
                  $(this).addClass('read');

                if ($(this).css('text-decoration') == 'underline')
                  $(this).addClass('readcard');

                if ($(this).css('background-color') != 'rgba(0, 0, 0, 0)' && $(this).css('background-color') != 'transparent')
                  $(this).addClass('readcardsuper');

                if ($(this).css('text-align') == 'center')
                  $(this).addClass('h1');



              })

              $(".doc style").remove()

            }, 500);






          }
        });
      });

    };

    var view = new google.picker.View(google.picker.ViewId.DOCUMENTS);
    view.setMimeTypes("application/vnd.google-apps.document");

    var picker = new google.picker.PickerBuilder()
      .enableFeature(google.picker.Feature.NAV_HIDDEN)
      .addView(view)
      .setOAuthToken(authToken)
      .setDeveloperKey(apiKey)
      .setCallback(filePickerResponse)
      .build();
    picker.setVisible(true);


  });

  /*

  $("#speech1AC, #speech1NC").on("scroll", function() {


      var list= $("#speech1AC p");

      for(var i =0; i < list.length; i++)
        if ( list[i].getBoundingClientRect().top > 150 )
          break;

      $("#speech1AC .r").css("top", list[i].getBoundingClientRect().top );




      var list= $("#speech1NC p");

      for(var i =0; i < list.length; i++)
        if ( list[i].getBoundingClientRect().top > 150 )
          break;

      $("#speech1NC .r").css("top", list[i].getBoundingClientRect().top );





  })
  */

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


  $("#superreadcard").click(function() {

    var selectionContents = window.getSelection().getRangeAt(0).cloneContents();
    var div = $("<span>").append(selectionContents);

    var colorToUse = "white";
    if (div.find("*[style*='yellow']").length == 0 && $(window.getSelection().anchorNode.parentNode).closest("*[style*=background-color]").css("background-color") != "rgb(255, 255, 0)")
      colorToUse = "yellow";

    document.execCommand('backColor', false, colorToUse);
  })


  $("#normal").click(function() {


    document.execCommand('removeFormat');

    var range = window.getSelection().getRangeAt(0);
    var selectionContents = range.toString();
    var div = document.createElement("span");

    div.innerHTML = selectionContents;
    range.deleteContents();
    range.insertNode(div);


  })


  /// ... end button dropdown menu
  $('.dropdown-toggle').dropdown()


  $(".dropdown-menu").on("click", "li", function(e) {
    var btn = $(e.target).attr('class');

    if (btn == "ft-collapse-btn")
      $(".file.ft-name:not(.collapsed)").siblings(".ft-icon").click()

    if (btn == "ft-expand-btn")
          $(".file.ft-name.collapsed").siblings(".ft-icon").click()


    if (btn == "set-size-0"){

          $('#docs, .tab-content').attr('class', "size-mode-0");
          $('.speech').parent().addClass('tab-content');
    }

    if (btn == "set-size-1"){

          $('#docs, .tab-content').attr('class', "size-mode-1");
          $('.speech').parent().addClass('tab-content');
    }

    //$(".doc:visible style, #round style").remove();
    //$(".readcard, .read, .readcardsuper").css("line-height", "100%")



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
    if ($("#round").is(":visible")) {
      $("#round, #timer").hide();
      /*
      if ($(document).width() < 700)
        $("#docs").css("width", "65%");
      else
      */
      
    } else {
      $("#round, #timer").show();
      round_init()



    }


  });


  $("#searchtext").on('keydown', function(e) {

    if (e.keyCode == 13) {


      var val = $("#searchtext").val();
      var resp = "";

      if (u.name) {
        $.getJSON('/doc/search', {
          data: val
        }, function(resp) {

          // alert(resp)

          $('#sidebar').popover('destroy').popover({
            "hide": 5000,
            html: 'true',
            content: "'" + val + "' found in " + resp,
            placement: "right"
          }).popover('show');

        });
      } else {

        for (var i in u.index)
          if (u.index[i]['text'].indexOf(val) > -1)
            resp += u.index[i]['title'] + " ";


        $('#sidebar').popover({
          "hide": 5000,
          html: 'true',
          content: "d",
          placement: "right"
        }).popover('show');



      }


    }

  })




  // new file dialog box


  $("#file-new").click(function() {

    $("#file-new-modal").modal('show');


    $("#file-new-modal").on('shown.bs.modal', function() {
      $("#filename").focus().keydown(function(e) {
        if (e.keyCode == 13)
          $("#file-new-modal-submit").click();
      })
    });





  });


  $("#file-new-modal-submit").click(function() {

    if ($(".filetype:checked").val() == "file") {


      var fileData = {
        "type": "file ft-selected",
        "title": $("#filename").val(),
        "text": ""
      }


      if (local) {
        var id = "local" + Math.floor((10000 * Math.random()));

        fileData.id = id;

        localStorage["debate_" + id] = JSON.stringify(fileData);

        u.index.push(fileData);

        ft.populate(ft.root, u.index);



      } else {
        $.get("/doc/create", fileData, function(id) {


          fileData.id = id;



          u.index.push(fileData);



          ft.populate(ft.root, u.index);


        })
      }




      $(".ft-name:last").click();


    } else { //new folder

      var folderData = {
        "type": "folder",
        "userid": "local",
        "title": $("#filename").val()
      }


      u.index.push(folderData);

      ft.populate(ft.root, u.index);

      $(".ft-name:last").click();


    }


    //  $('.ft-name').click(ft.click);

    $("#file-new-modal").modal('hide');




  });


});
