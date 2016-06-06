


  //recognize speech

  $(window).keydown(function(e) {


    if (e.keyCode == 192) {






/*
      var recognition = new webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = function(event) {
        var final_transcript = '',
          interim_transcript = '';

        for (var i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final_transcript += event.results[i][0].transcript;
          } else {
            interim_transcript += event.results[i][0].transcript;
          }

          console.log(final_transcript + interim_transcript);
        }


        var range = window.getSelection().getRangeAt(0);
        var node = range.createContextualFragment(final_transcript);
        range.insertNode(node);





      };
      recognition.start();

*/


    }

window.smartScroll = function(){





						var h = $(window).height() ;

		      var plist = $(".doc:visible > .chunk > *");


		      for (var i = 0; i < plist.length; i++)
		        if (plist[i].getBoundingClientRect().bottom > h - 30)
		          break;

							console.log(
						plist.eq(i) )
				//	plist.eq(i).css("color", "yellow")

					var rangelist = plist.eq(i).find("span,b,u");

		      for (var i = 0; i < rangelist.length; i++)
		        if (rangelist[i].getBoundingClientRect().top > h -20)
		          break;




					rangelist.eq(i-1).addClass("scroll-marker")
					//rangelist.eq(i).addClass("scroll-marker")

					console.log(		$(".scroll-marker").offset());


								setTimeout(function() {

									bottom = 	$(window).height() - $(".scroll-marker")[0].getBoundingClientRect().bottom, right = $(window).width() -	$(".scroll-marker")[0].getBoundingClientRect().right


												var line = $("<div class='scroll-diagonal'>").css("bottom",bottom+"px").css("right",right+"px");

											$(".doc:visible").animate({
									 scrollTop: $(".doc:visible").scrollTop() + 	$(".scroll-marker:first").offset().top - 2
							 }, 'fast');


												var top = 	$(".scroll-marker")[0].getBoundingClientRect().top, left = 	$(".scroll-marker")[0].getBoundingClientRect().left


												line.css("top",top+"px").css("left",left+"px");



											line.appendTo("body")


															console.log(		$(".scroll-marker").offset());

											setTimeout(function() {


												$(".scroll-marker").removeClass("scroll-marker")

												$(".scroll-diagonal").remove()

											}, 400)


								}, 300)



}



if(e.keyCode==121) { e.preventDefault();







							var h = $(window).height() ;

			      var plist = $(".doc:visible > .chunk > *");


			      for (var i = 0; i < plist.length; i++)
			        if (plist[i].getBoundingClientRect().bottom > h - 30)
			          break;

								console.log(
							plist.eq(i) )
					//	plist.eq(i).css("color", "yellow")

						var rangelist = plist.eq(i).find("span,b,u");

			      for (var i = 0; i < rangelist.length; i++)
			        if (rangelist[i].getBoundingClientRect().top > h -20)
			          break;




						rangelist.eq(i-1).addClass("scroll-marker")
						//rangelist.eq(i).addClass("scroll-marker")

						console.log(		$(".scroll-marker").offset());


									setTimeout(function() {

										bottom = 	$(window).height() - $(".scroll-marker")[0].getBoundingClientRect().bottom, right = $(window).width() -	$(".scroll-marker")[0].getBoundingClientRect().right


													var line = $("<div class='scroll-diagonal'>").css("bottom",bottom+"px").css("right",right+"px");

												$(".doc:visible").animate({
										 scrollTop: $(".doc:visible").scrollTop() + 	$(".scroll-marker:first").offset().top - 2
								 }, 'fast');


													var top = 	$(".scroll-marker")[0].getBoundingClientRect().top, left = 	$(".scroll-marker")[0].getBoundingClientRect().left


													line.css("top",top+"px").css("left",left+"px");



												line.appendTo("body")


																console.log(		$(".scroll-marker").offset());

												setTimeout(function() {


													$(".scroll-marker").removeClass("scroll-marker")

													$(".scroll-diagonal").remove()

												}, 400)


									}, 300)


 }


















   /*
   // filenames edited in tree
   .on("mouseup", ".ft-name.ft-file", function(e){
     // $(this).attr('contenteditable', true);
   })
   clicking item handles the click, loads file

     options dropdown shouldnt exit on select users
   /*.on("mousedown", ".ft-item .select2", function(){

     $("body").on("hide.bs.dropdown", ".ft-options", function(e){ console.log(e)
      e.preventDefault();
     })
   })

   .on("blur", ".select2-search__field", function(){
     $("body").unbind("hide.bs.dropdown");
   })

   //TODO fix double click on file and check dragging

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


     $.post('/doc/update', {
       title: newTitle,
       id: id
     }, function(new_url){

       history.pushState(null, "", new_url);

     });


     //alter index and upload it
     u.index=u.index.map(function(i){
       if (i.id==id)
         i.title = newTitle
       return i;
     });

     ft.updateIndex();

   })


   $("body").on("click", ".ft-item", function(e){

       //partial load only the heading block
    return;

      var id = $(this).find(".ft-name").attr('id').split("_");
      var fileId = id[0], partial = id[1] || 0;
      var name = $(this).find(".ft-name").text();
      if(!partial) return


       ft.ongoingXhrFilePartialId = fileId


        if (ft.ongoingXhrFilePartialId != fileId)
        return

      $.ajax({
        xhr: function() {
          var xhr = new window.XMLHttpRequest();
          xhr.addEventListener("progress", function(evt) {
           // console.log( ft.ongoingXhrFilePartialId + " " +  fileId)
              if (ft.ongoingXhrFilePartialId != fileId)
                xhr.abort();


          }, false);

          return xhr;
        },
        url: "/doc/read",
        data: {id: fileId, partial: partial, name: name},
        success: function(docJSON){



               setTimeout(function(){
             ///    if (ft.ongoingXhrFilePartialId != fileId)
             //    return
           if (docJSON.text.length < 300) return


           partial  = $("<div class='doc-partial' contenteditable>"+docJSON.text+"</div>")

           partial.css("position", "absolute").css("top","0").css("left", "300px")

           partial.appendTo("#doc-"+ft.selected.id)

           $(".doc:visible > *").hide();


           partial.show() //.hide().fadeIn("fast", function () {       })


         //  loadFile(ft.ongoingXhrFilePartialId)


                 }, 1000)
         }})




   })
   */
