$(document).ready(function() {

  //SIDEBAR BUTTONS

  $('button').tooltip();


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



  $('.dropdown-toggle').dropdown()


  $(".dropdown-menu").on("click", "li", function(e) {

    //$(".doc:visible style, #round style").remove();
//$(".readcard, .read, .readcardsuper").css("line-height", "100%")



    $('#docs, .speech').attr('class', "size-mode-" + $(e.target).attr('class').substring(2));

  })


  $("#big").click(function() {

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

    list[i].scrollIntoView();

  })


  $("#showround").click(function() {
    if ($("#round").is(":visible")) {
      $("#round, #timer").hide();

      if ($(document).width() < 700)
        $("#docs").css("width", "65%");
      else
        $("#docs").css("width", "85%");

    } else {
      $("#round, #timer").show();

      if ($(document).width() < 700) {
        $("#round").css("width", "65%");
        $("#docs").css("width", "0%");
      } else {
        $("#docs").css("width", "40%");
        $("#round").css("width", "45%");

      }

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


    $("#file-new-modal").on('shown.bs.modal', function () {
      $("#filename").focus().keydown(function(e){
        if(e.keyCode==13)
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
        var id = "local"+Math.floor((10000 * Math.random()));

        fileData.id=id;

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
