
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

});

$('#settings_save').click(function() {

    $.post("/user/update", {
       // debatetype: $(".debatetype:checked").val(),
       // teamname: $("#teamname").val(),
        custom_css: $("#custom-css").val(),
        custom_js: $("#custom-js").val()
    },function(){
         location.reload();
    });

    $("#settings").modal('hide');

});

$('#settings_logout').click(function() {
  document.location.pathname = '/auth/logout';
});


$("#import_googledrive").click(function () {

    var filePickerResponse = function (pickedFilesData) {

        if (pickedFilesData.action!="picked") return;

        gapi.client.drive.files.get({ 'fileId': pickedFilesData.docs[0].id   })
          .execute(function(resp) {
            $.ajax({
                url: resp.exportLinks["text/html"],
                type: 'GET',
                beforeSend: function(xhr) {
                    xhr.setRequestHeader('Authorization', 'Bearer ' + gapi.auth.getToken().access_token);
                },
                data: {},
                success: function(fileHtml) {

                    //create new

                    $("#editor").html(fileHtml)

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



      var headingToUse =  "h1";
      var parentHeading =  $(  window.getSelection().anchorNode.parentNode ).closest("h1");

      if ( parentHeading.length > 0 )
        parentHeading[0].outerHTML =  parentHeading.html();
      else
        document.execCommand('formatBlock', false, headingToUse);




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

    var colorToUse =  "white";
    if (  div.find("*[style*='yellow']").length == 0
      && $(window.getSelection().anchorNode.parentNode).closest("*[style*=background-color]").css("background-color") != "rgb(255, 255, 0)")
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


$("#big").click(function() {

    u.big = !u.big ? 1 : u.big==2 ? 0 : 2;



var list= $(".tab-content .active p");

for(var i =0; i < list.length; i++)
  if ( list[i].getBoundingClientRect().top > 0 )
    break;






    if (u.big == 0){

      $("#editor, .speech").find("*[style]").filter(function(){
        return $(this).css('background-color') != "rgba(0, 0, 0, 0)";
    }).css("font-size", "").css("line-height", "")
        $("#editor, .speech").find("*[style*='yellow'], b, u, h1").css("font-size", "").css("line-height", "")
      $("#editor, .speech").css("font-size","100%")
    }else if (u.big == 1){
      $("#editor, .speech").find("*[style]").filter(function(){
        return $(this).css('background-color') != "rgba(0, 0, 0, 0)";
    }).css("font-size", "30pt").css("line-height", "100%");
        $("#editor, .speech").find("*[style*='yellow'], b, u, h1").css("font-size", "30pt").css("line-height", "100%");
        $("#editor, .speech").css("font-size","30%");
    }else if (u.big == 2){
        $("#editor, .speech").find("u").css("font-size", "").css("line-height", "")

    }

 list[i].scrollIntoView();

})


$("#showround").click(function() {
    if ($("#round").is(":visible")) {
        $("#round").hide();

        if ($(document).width() < 700)
          $("#editor").css("width", "65%");
        else
          $("#editor").css("width", "85%");

    } else {
        $("#round").show();

        if ($(document).width() < 700) {
          $("#round").css("width", "65%");
          $("#editor").css("width", "0%");
        }else{
          $("#editor").css("width", "40%");
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
            $.post('/doc/search', {
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


});


