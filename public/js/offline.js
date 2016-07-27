
  //offline debate file backup
	if (window.chrome && window.chrome.runtime && 0) //TURNED OFF
	$.ajaxSetup({
        beforeSend: function(xhr,settings ) {

          if (settings.url.indexOf('/doc/update')>-1){
            var data = settings.data;

            chrome.runtime.sendMessage("gjmlmcioghkhdoogndhiblcepheohefn", {"setFile": data},
                function(response) {

            });

          }

					if (settings.url.indexOf('/user/update')>-1){
						var data = settings.data;

						chrome.runtime.sendMessage("gjmlmcioghkhdoogndhiblcepheohefn", {"setIndex": data},
								function(response) {

						});

					}



          if (settings.url.indexOf('/doc/read')>-1){
            var id = settings.url.split("id=")[1];



            chrome.runtime.sendMessage("gjmlmcioghkhdoogndhiblcepheohefn", {getFile: id},
                function(response) {


                  console.log(response)

                  var html = response[id];

                  $(".doc:last").show().html(html)



            });

          // return false;

          }



        }
    });
