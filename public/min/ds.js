// Proudly sponsored by Total Business Synergy, Inc., distributed under the TotalBS 2.0 License
//TODO create parenting -- when you're dragging the headings  have arrow icon under
//collapsible heading levels and auto load which level, dragging headigns into another documents
// takes a div container on page to fill with supplied dom parsed into filetree
//save doc to server, update headings into index
//  if (window.off)return;
// var selectedId = navFile.find("nav").index(nav);
//  ft.updateIndex();
//upload tree index to server
//click on NAV ul or NAV .h1 or pass the id to click
//
// //same as single click, but then select the text inside or o
// dblclick: function() {
//
//   if ($(this).hasClass("heading")) {
//
//     var id = $(this).attr('id');
//
//     var headingId = parseInt(id.substring(id.indexOf("_") + 1));
//     id = id.substring(0, id.indexOf("_"));
//
//
//     var headingList = $("#doc-"+ft.selected.id).find("h1, h2, h3");
//
//     var endNode = headingId == headingList.length - 1 ? $("#docs>p:last")[0] : headingList[headingId + 1];
//
//
//     range = document.createRange();
//     range.setStart(headingList[headingId], 0);
//     range.setEnd(endNode, 0);
//     sel = window.getSelection();
//     sel.removeAllRanges();
//     sel.addRange(range);
//
//   }
//
//   if (!$(this).hasClass("ft-file") && !$(this).hasClass("folder"))
//     return;
//   //TODO what should dblclick/ longtouch on file titles do?
//
// }
//MOBILE: swipe to toggle sidebar
//SIDEBAR resizable
//key shortcuts F1-F8
//save file before closing tab
//  ft.update();
// open round panel
// if (typeof(io)=="undefined") return
//INIT
// Thanks to Mountain Dew and Girl Scout Cookies for the generous donations which made this software possible
//key shorcuts UHB
//
//   $(document).keydown(function(e){
//     if (getSelection().isCollapsed) return;
//
// if (e.which==66 ) {
//     document.execCommand('bold');  e.preventDefault()
// }
// if (e.which==72 ) {
//     $("#format-highlight").click();  e.preventDefault()
// }
// if (e.which==85 ) {
//     document.execCommand('underline');  e.preventDefault()
// }
// })
//EDITOR PASTE SPECIAL -- paste plain text except debate formatting
//TODO it's all bold if ur in bold place >> smart unformatting
//CARD SELECT - click to select whole card and normalize its font size
//analytics
//if user logged in, initiallize settings and index
// if (nochromeext)
//init filetree
//RESOURCE DELAYED LOADER
// //reset scrolls
// setInterval(function () { return;
//
//
//
//
//
// //	window.scrollTo(0,200)
//
// }, 2000)
//URL fileID change to load debate file
//TODO back fwd overrites hisory non sequential because of push state on back button
//$(window).trigger('popstate')
//TODO
//call in neurons and make it likr https://coggle.it/folder/gallery https://coggle.it/diagram/VzG8jZQ8GiE1azVU
// "What I cannot create, I do not understand."
// -- Richard Feynman
//DOCX TO HTML SUPPORT: drop docx on page to convert to debate-ready html and added for user
//    }
function initControls(){function e(){var e=function(e){"picked"==e.action&&gapi.client.drive.files.get({fileId:e.docs[0].id}).execute(function(e){$.ajax({url:e.exportLinks["text/html"],type:"GET",beforeSend:function(e){e.setRequestHeader("Authorization","Bearer "+gapi.auth.getToken().access_token)},success:function(t){$.get("/doc/create",{title:e.title},function(n){u.index.push({type:"ft-file ft-selected",title:e.title,id:n._id}),ft.populate(ft.root,u.index),ft.loadFile(n._id,function(){$(".doc:visible .chunk").html(t).find("span, u").each(function(){"bold"==$(this).css("font-weight")&&$(this).wrap("<b>"),"underline"==$(this).css("text-decoration")&&$(this).wrap("<u>"),"rgba(0, 0, 0, 0)"!=$(this).css("background-color")&&"transparent"!=$(this).css("background-color")&&$(this).wrap('<span style="background-color: yellow;">'),"center"==$(this).css("text-align")&&$(this).wrap("<h2>"),$(".doc style").remove()}),ft.update()})})}})})},t=new google.picker.View(google.picker.ViewId.DOCUMENTS)
t.setMimeTypes("application/vnd.google-apps.document"),(new google.picker.PickerBuilder).enableFeature(google.picker.Feature.NAV_HIDDEN).addView(t).setOAuthToken(gapi.authToken).setDeveloperKey(gapi.key).setCallback(e).build().setVisible(!0)}$("#showfileinfo").click(function(){if(!ft.selected.id)return void alert("Select a file to view its information.","warning",null,!0)
if($("#modal-file").show(),$("#file-info-title").text(ft.selected.title),$("#file-info-created").text(new Date(ft.selected.date_created).toLocaleString()),$("#file-info-modified").text(new Date(ft.selected.date_updated).toLocaleString()),$("#file-info-words").text($(".doc:visible").text().split(/\b\S+\b/g).length-1+" total"),ft.selected.userid!=u._id)$.getJSON("/user/"+ft.selected.userid,function(e){$("#file-info-owner").text(e.name+" ("+e.email+")")}),$("#file-share-by-owner").hide()
else{$("#file-share-by-owner").show(),$("#file-info-owner").text("me"),$("#file-info-title").attr("contenteditable","true")
var e=0
"team"==ft.selected.share&&(e=1),"public"==ft.selected.share&&(e=2),"specific"==ft.selected.share&&(e=3),$(".radio-share").eq(e).attr("checked","checked"),$("#share-select").empty()
for(var t in ft.selected.shareusers)$("#share-select").append("<option value='"+ft.selected.shareusers[t].id+"' selected>"+ft.selected.shareusers[t].text+"</option>")
$("#share-select").trigger("change")}}),$("#share-select").select2({ajax:{url:"/user/search",dataType:"json",delay:50,data:function(e){return{userinfo:e.term}},processResults:function(e,t){return{results:e.splice(0,u.name?5:0)}},cache:!0},minimumInputLength:4,escapeMarkup:function(e){return e},maximumSelectionLength:9,templateResult:function(e){return e.email?u.name?"<span><b>"+e.text+"</b> "+e.email+"</span>":"Login required":e.text}}),$(".ft-delete").click(function(){var e=ft.selected.id
if(ft.selected.userid!=u._id){if(!confirm('Are you sure you want to remove yourself as a shared collaborator of the file "'+ft.selected.title+'"?'))return
$.post("/doc/update",{id:ft.selected.id,shareusers_remove_me:!0})}else{if(!confirm('Are you sure you want to delete the file "'+ft.selected.title+'"'+(ft.selected.share?" from yourself and all shared users":"")+"?"))return
$.get("/doc/delete",{id:e})}$("#"+e).closest(".ft-item").remove(),u.index=u.index.filter(function(t){return t.id!=e}),$("#doc-"+e).remove(),ft.selected={},ft.updateIndex(),$("#modal-file").hide()}),$("#file-info-modal-submit").click(function(){var e=$("#file-share-by-owner input:checked").attr("id").substring(6)
$.post("/doc/update",{id:ft.selected.id,title:$("#file-info-title").val(),share:e,shareusers:$("#share-select").select2("data").map(function(e){return{id:e.id,text:e.text}})}),$("#"+ft.selected.id).closest(".ft-item").addClass(e),$("#modal-file").hide()}),$("#showsettings").click(function(){$("#team-members-select").select2({ajax:{url:"/user/search",dataType:"json",delay:50,tags:!0,data:function(e){return{userinfo:e.term}},processResults:function(e,t){return{results:e.splice(0,u.name?5:0)}},cache:!0},minimumInputLength:2,escapeMarkup:function(e){return e},maximumSelectionLength:100,templateResult:function(e){return e.email?u.name?"<span><b>"+e.text+"</b> "+e.email+"</span>":"Login required":e.text}}),u.options&&($(".debatetype").eq(u.options.debatetype-1).prop("checked",!0),$("#custom-css").val(u.custom_css),$("#custom-js").val(u.custom_js)),$("#settings").show()}),$("#settings_logout").click(function(){document.location.pathname="/logout"}),$("#btn-settings-save").click(function(){$.post("/user/update",{options:JSON.stringify({debatetype:$(".debatetype:checked").val()}),custom_css:encodeURIComponent($("#custom-css").val()),custom_js:encodeURIComponent($("#custom-js").val())},function(e){location.reload()}),$("#settings").hide()}),$("#file-new").click(function(){$("#modal-file-new").show(),$("#file-new-modal").on("shown.bs.modal",function(){$("#filename").focus().keydown(function(e){13==e.keyCode&&$("#file-new-modal-submit").click()})})}),$("#file-new-modal-submit").click(function(){if("file"==$(".filetype:checked").val()){var e={type:"file selected",title:$("#filename").val(),text:""}
$.get("/doc/create",e,function(t){e.id=t._id,u.index.push(e),ft.populate(ft.root,u.index)}),$(".ft-name:last").click()}else{var t={type:"folder",userid:"local",title:$("#filename").val()}
u.index.push(t),ft.populate(ft.root,u.index),$(".ft-name:last").click()}$("#modal-file-new").hide()}),$("#import_googledrive").click(function(){$("#modal-file-new").hide(),window.google?e():$("head").append('<script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.0.0/jszip.min.js" ></script><script src="https://apis.google.com/js/client.js?onload=gapiInit" ></script>')}),window.gapiInit=function(){gapi.key="AIzaSyDgdM5CpdzE3dLHD877L8fB3PyxVpV7pY4",gapi.client.setApiKey(gapi.key),gapi.auth.authorize({client_id:"675454780693-7n34ikba11h972dgfc0kgib0id9gudo8.apps.googleusercontent.com",scope:["profile","email","https://www.googleapis.com/auth/drive"],immediate:!0},function(t){console.log(t),gapi.authToken=t.access_token,gapi.client.load("drive","v2",function(){}),gapi.load("picker",{callback:e})})}}function loadFile(e,t){if(ft.ongoingXhrId=e,!$("#doc-"+ft.selected.id).length||$("#doc-"+ft.selected.id).attr("id").substring(4)!=e||ft.selected.id!=e){$("#doc-"+ft.selected.id).hide()
var n=$("#doc-"+e)
if(n.length)return n.show(),ft.selected=n.data("info"),$(".opened").removeClass("opened"),$("#"+e).addClass("opened"),$("#"+e).hasClass("collapsed")&&$("#"+e).parent().find(".ft-icon").click(),ft.selected&&(history.pushState(null,"",ft.selected.id),$("#select2-searchtext-container").html(ft.selected.title)),void(t&&t())
$(".glyphicon-refresh").removeClass("glyphicon-refresh glyphicon-spin"),$("#"+e+" ").prev().find(".ft-icon").addClass("glyphicon-refresh glyphicon-spin"),$(".opened").removeClass("opened"),ft.selected={},$.ajax({xhr:function(){var t=new window.XMLHttpRequest
return t.addEventListener("progress",function(n){if(n.lengthComputable){var i=Math.floor(n.loaded/n.total*100)
ft.ongoingXhrId==e?($("#"+e).closest("ul").css("background","linear-gradient(90deg, rgb(170, 207, 231) "+i+"%, transparent 0%)"),$("#"+e).next().css("background-color","white")):t.abort()}},!1),t},url:"/doc/read",data:{id:e,partial:window.preloadHeading},error:function(t){return"Access denied"==t.responseText&&alert("Access denied to file <b>"+e+"</b>."+($("#filetree #"+e).length?' Remove from file tree? <button data-dismiss="alert" class="btn btn-xs btn-primary">OK</button>':""),"failure",null,!$("#filetree #"+e).length).on("click",".btn-primary",function(){return $("#filetree #"+e).length?void $("#filetree #"+e).closest(".ft-item").remove():void 0}),"Not found"==t.responseText?void alert("File <b>"+e+"</b> is not found."+($("#filetree #"+e).length?' Remove from file tree? <button data-dismiss="alert" class="btn btn-xs btn-primary">OK</button>':""),"failure",null,!$("#filetree #"+e).length).on("click",".btn-primary",function(){$("#filetree #"+e).length&&$("#filetree #"+e).closest(".ft-item").remove()}):void 0},success:function(e){console.log(Date.now()),ft.selected=e,ft.selected.id=ft.selected._id,"undefined"==typeof history.pushState?location.hash=ft.selected.id:history.pushState(null,"",ft.selected.url),$("#"+ft.selected.id).addClass("opened").removeClass("collapsed")
var n='<article class="doc" id="doc-'+ft.selected.id+'" >'
if(!document.querySelector("#doc-"+ft.selected.id)){if(window.chunk){var i=1e5
chunk_len=Math.ceil((ft.selected.text.length+1)/i)
for(var o=0;o<chunk_len;o++)n+="<section contenteditable>"+ft.selected.text.substring(o*i,(o+1)*i)+"</section>"}else{var n='<div contenteditable class="doc" id="doc-'+ft.selected.id+'" >'
n+=ft.selected.text}n+="</article>",$(".doc").hide(),$("#docs")[0].insertAdjacentHTML("beforeend",n)}delete ft.selected.text,$("#doc-"+ft.selected.id).data("info",ft.selected),$("#"+ft.selected.id).hasClass("collapsed")&&$("#"+ft.selected.id).parent().find(".ft-icon").click(),$("#"+ft.selected.id).length||(u.index||(u.index=[]),u.index.push({id:ft.selected.id,title:ft.selected.title,type:"ft-file ft-selected"}),ft.populate($("#filetree"),u.index)),$("#doc-"+ft.selected.id).on("scroll",function(){clearTimeout(window.scrollThrottle),window.scrollThrottle=setTimeout(navScrollHeading,250)}),t&&t(),$("#select2-searchtext-container").html(ft.selected.title),ft.updateNeeded=!0,setTimeout(ft.update,2e3)}})}}function initRoundActions(){$(".speech").on("input",function(){var e=$(this).find("#index").length?$(this).find("#index"):$("<div>").attr("id","index").css("margin-top","-20px").css("position","absolute").prependTo($(".speech.active")),t=$(this).find("h1")
e.empty()
for(var n=0;n<t.length;n++){var i=t[n]
i.textContent.length>2&&e.append($("<a>").attr("onClick",'$(this).parent().parent().find("h1")['+n+"].scrollIntoView();").html(i.textContent)).append(" &bull; ")}e.contents().last().remove(),$.post("round/update",{roundId:r._id,speech1AC:$("#speech1AC").html(),speech1NC:$("#speech1NC").html(),speech2AC:$("#speech2AC").html(),speech2NC:$("#speech2NC").html(),speech1NR:$("#speech1NR").html(),speech1AR:$("#speech1AR").html(),speech2NR:$("#speech2NR").html(),speech2AR:$("#speech2AR").html()})}),$("#docs").on("dragstart",function(e){var t=window.getSelection().getRangeAt(0),n=$("#drag-copy")
n.hide()
var i=t.cloneContents()
n.empty(),n.append(i),e.originalEvent.dataTransfer.effectAllowed="copy",$("#round .tab-pane").bind("dragover",!1)}),$("#docs").bind("dragend",function(e){$("#drag-copy").empty()}),$(".speech-nav").bind("dragover",!1).bind("drop",function(e){"false"!=$("#"+e.target.href.replace(/.+\#/gi,"")).attr("contenteditable")&&0!=$("#drag-copy").html().length&&(e.preventDefault(),e.stopPropagation(),$("#"+e.target.href.replace(/.+\#/gi,"")).append($("#drag-copy").html()),$("#drag-copy").empty())}),$(".speech").bind("drop",function(e){return"false"!=$(this).attr("contenteditable")&&0!=$("#drag-copy").html().length?(e.preventDefault(),e.stopPropagation(),$(e.target).append($("#drag-copy").html()),$("#drag-copy").empty(),$("#round .tab-pane").unbind("dragover"),!1):void 0}),$(".speech").on("scroll",function(){if("false"!=$(this).attr("contenteditable")&&$("li.active a").hasClass("btn btn-info")){console.log($(this).attr("contenteditable"))
var e=$(this).attr("scroll")||0,t=$(this).offset().top+$(this).height()-20,n=$(this).offset().left+50,i=$(document.elementFromPoint(n,t))
i=null!=i.next()?i.next():i,console.log(i)
var o=$(this).html().replace(/[\r\n]/gi,"").indexOf(i.html().replace(/[\r\n]/gi,""),e-20)
console.log(o),e>o&&(o=e),$(this).attr("scroll",o),$.get("round/updateScroll",{roundId:r._id,speechName:$(this).attr("id"),scrollTo:o})}})}function startRound(){$("#round").is(":visible")||$("#showround").click(),$.getJSON("/round/read",{id:r._id},function(e){r=e,$("#speech1AC").html(r.speech1AC.text),$("#speech1NC").html(r.speech1NC.text),$("#speech2AC").html(r.speech2AC.text),$("#speech2NC").html(r.speech2NC.text),$("#speech1NR").html(r.speech1NR.text),$("#speech1AR").html(r.speech1AR.text),$("#speech2NR").html(r.speech2NR.text),$("#speech2AR").html(r.speech2AR.text),$(".username-select").empty(),$("#aff1").append("<option value='"+r.aff1.id+"'selected>"+r.aff1.name+"</option>"),$("#aff2").append("<option value='"+r.aff2.id+"'selected>"+r.aff2.name+"</option>"),$("#neg1").append("<option value='"+r.neg1.id+"'selected>"+r.neg1.name+"</option>"),$("#neg2").append("<option value='"+r.neg2.id+"'selected>"+r.neg2.name+"</option>")
for(var t in r.judges)$("#judges").append("<option value='"+r.judges[t].id+"' selected>"+r.judges[t].name+"</option>")
$(".username-select").trigger("change")
for(var t in r.judges)r.judges[t].status&&$("#judges+span .select2-selection__choice").eq(t).css("background-color","rgb(170, 207, 231)")
r.judges.find(function(e){return!e.status})?$("#judges").addClass("btn-info"):$("#judges").removeClass("btn-info").attr("disabled",!0),r.aff1.status?$("#aff1").removeClass("btn-info").attr("disabled",!0):$("#aff1").addClass("btn-info"),r.aff2.status?$("#aff2").removeClass("btn-info").attr("disabled",!0):$("#aff2").addClass("btn-info"),r.neg1.status?$("#neg1").removeClass("btn-info").attr("disabled",!0):$("#neg1").addClass("btn-info"),r.neg2.status?$("#neg2").removeClass("btn-info").attr("disabled",!0):$("#neg2").addClass("btn-info"),r.aff1.id==u.id||r.aff2.id==u.email.id?r.mySide="aff":r.neg1!=u.email&&r.neg2!=u.email||(r.mySide="neg"),$("#speech1AC, #speech2AC, #speech1AR, #speech2AR").addClass("aff"),$("#speech1NC, #speech2NC, #speech1NR, #speech2NR").addClass("neg"),$("#roundcreate").text("Resend")})}function initRoundPanel(){$("#judges, #aff1, #aff2, #neg1, #neg2").select2({ajax:{url:"/user/search",dataType:"json",delay:50,data:function(e){return{userinfo:e.term}},processResults:function(e,t){return{results:e.splice(0,u.name?5:0)}},cache:!0},minimumInputLength:2,escapeMarkup:function(e){return e},maximumSelectionLength:9,templateResult:function(e){return e.email?u.name?"<span><b>"+e.text+"</b> "+e.email+"</span>":"Login required":e.text}}),$(".speech-nav").click(function(e){var t=$(this).attr("id").replace("-nav","")
if($(".active-speech").removeClass("active-speech"),$("#"+t).addClass("active-speech"),$(".active-nav").removeClass("active-nav"),$(this).addClass("active-nav"),$(".speech:not(.active-speech)").hide(),$(".active-speech").show(),$("#sidebyside").hasClass("active")&&$(".active-nav").index()>1){var n=$(".active-speech").prev(".speech")
"speech1NR"==$(".active-speech").attr("id")&&(n=n.prev()),n.show()}}),$("#sidebyside").click(function(){$(this).toggleClass("active"),$(".active-nav").click()}),$("#roundcreate").click(function(){$("#aff1, #aff2, #neg1, #neg2, #judges").removeClass("btn-danger"),"Invite"==$("#roundcreate").text()?$.getJSON("/round/create",{aff1:$("#aff1").val(),aff2:$("#aff2").val(),neg1:$("#neg1").val(),neg2:$("#neg2").val(),judges:$("#judges").val()},function(e){$("#aff1, #aff2, #neg1, #neg2, #judges").removeClass("btn-danger")
for(var t in e)$("#"+e[t]).addClass("btn-danger")}):$.get("round/resend",{roundId:r._id})}),$("#speech-flow-mode").click(function(){$(".active-speech").toggleClass("flow-mode"),$(".speech").attr("contenteditable","true"),$(".flow-mode").attr("contenteditable","false"),$(".active-nav i").remove(),$(".active-nav").hasClass("scroll")?$(".active-nav").removeClass("scroll").prepend('<i class="fa fa-fw fa-pencil"></i>'):$(".active-nav").addClass("scroll").prepend('<i class="fa fa-fw fa-cloud-download"></i>'),$(".active-speech").scrollTop($(".active-speech").scrollTop()+Math.floor(.99*$(".active-speech").height())),$(".active-speech").trigger("scroll")}),$("#fullscreen").click(function(){$("#round").css("max-width","100%"),$("#sidebar, #docs").hide()}),$("#speechscroll").click(function(){$(".active-nav i").remove(),$(".active-nav").hasClass("scroll")?$(".active-nav").removeClass("scroll").prepend('<i class="fa fa-fw fa-eye-slash"></i>'):$(".active-nav").addClass("scroll").prepend('<i class="fa fa-fw fa-eye"></i>'),$(".active-speech").scrollTop($(".active-speech").scrollTop()+Math.floor(.99*$(".active-speech").height())),$(".active-speech").trigger("scroll")})}function openRoundPanel(){$("#round").show(),$.getJSON("/round",function(e){$("#pastrounds").empty(),e.length&&$("#pastrounds").addClass("well")
for(var t in e){var n=$("<div>")
n.attr("id",e[t]._id),n.html("<a class='label label-default'>"+new Date(e[t].date_created).toLocaleDateString()+"</a> "+e[t].aff1.name+" "+e[t].aff2.name+" <strong>vs</strong> "+e[t].neg1.name+" "+e[t].neg2.name+" <strong>judged by</strong> "+e[t].judges.map(function(e){return e.name}).join(", ")),n.click(function(){r._id=$(this).attr("id"),startRound()}),$("#pastrounds").append(n)}})}function initSockets(){window.socket=socket=io({transports:["websocket"]}),socket.on("error",function(e){console.log(e)}).on("connect",function(){socket.on("round_newTextForEnemy",function(e){$("#"+e.speechName).html(e.speechPartial)}),socket.on("round_newTextForPartner",function(e){$("#speech1AC").html(e.speech1AC),$("#speech1NC").html(e.speech1NC),$("#speech2AC").html(e.speech2AC),$("#speech2NC").html(e.speech2NC),$("#speech1NR").html(e.speech1NR),$("#speech1AR").html(e.speech1AR),$("#speech2NR").html(e.speech2NR),$("#speech2AR").html(e.speech2AR)}),socket.on("round_youAreInvited",function(){roundInviteAlert()}),socket.on("round_inviteResponse",function(e){console.log(e),startRound()}),socket.on("doc_partial",function(e){partial=$("<div class='doc ' contenteditable>"+e.text+"</div>"),partial.css("background","white"),partial.appendTo("#docs"),partial.find("h1,h2,h3")[0].scrollIntoView()})}),$(window).on("beforeunload",function(){socket&&socket.close()})}function initTimer(){function e(){window.timerInterval=setInterval(function(){if(!(0>=o)){o--,o||($("#btn-play-container").click(),beep_final.play(),$("body").append('<div id="timeup" style="position: absolute; height: 100%; width: 100%;top: 0;left: 0;z-index: 9999;background-color: red;"></div>'),setTimeout(function(){$("#timeup").remove()},2e3)),$("#count").val(t(o))
var e=$("#count").attr("class")
"btn-timer-aff"!=e&&"btn-timer-neg"!=e||$("#"+e).html($("#count").val())}},1e3)}function t(e){return Math.floor(e/60)+":"+(10>e%60?"0":"")+e%60}function n(e){var t=e.indexOf(":")
return 60*(parseInt(e.substring(0,t>-1?t:e.length>1?e.length-2:1))||0)+(parseInt(e.substring(t>-1?t+1:e.length>1?e.length-2:1))||0)}var i=u.options&&2==u.options.debatetype?[9,6,10]:u.options&&3==u.options.debatetype?[6,7,4]:[8,5,8],o=60*i[0]
$("#btn-timer-crossx").html("3"),$("#btn-timer-constructive").html(i[0]),$("#btn-timer-rebuttal").html(i[1]),$("#btn-timer-aff, #btn-timer-neg").html(i[2]),$("#count").val(t(o)),$("#btn-play-container").click(function(){$("#btn-play").toggleClass("play").toggleClass("pause"),$("#btn-play").hasClass("play")?clearInterval(timerInterval):e(),beep.play()}),$("#btn-timer-aff, #btn-timer-neg, #btn-times-container > div").click(function(){o=n($(this).text())||0,10==o&&(o=600),$("#count").val(t(o)).attr("class",this.id)}),$("#count").mousedown(function(e){$("#btn-play").hasClass("pause")&&$("#btn-play-container").click()}).keypress(function(e){return 13==e.keyCode&&(e.preventDefault(),$(this).blur(),$("#btn-play-container").click()),e.keyCode>=48&&e.keyCode<=58}).change(function(e){o=n($(e.target).val()),$("#count").val(t(o))})}function navScrollHeading(){for(var e=$("#doc-"+ft.selected.id).find("h1, h2, h3"),t=0;t<e.length;t++)if(e[t].textContent.length<3)e.splice(t--,1)
else if(e[t].getBoundingClientRect().top>100)break
$(".selected").removeClass("selected"),$("#"+ft.selected.id).find("li").eq(t-1).addClass("selected"),$(".selected")[0]&&($(".selected")[0].scrollIntoView(),$("#filetree")[0].scrollTop-=.2*filetree.clientHeight)}function pasteHtmlAtCaret(e){sel=getSelection(),range=sel.getRangeAt(0),range.deleteContents(),el=range.createContextualFragment(e)
for(var t,n,i=document.createDocumentFragment();t=el.firstChild;)n=i.appendChild(t)
var o=i.firstChild
range.insertNode(i),n&&(range=range.cloneRange(),range.setStartAfter(n),range.setStartBefore(o),sel.removeAllRanges(),sel.addRange(range))}function initFlow(){$("#round").on("mousedown click",".flow-mode",function(e){console.log(e)
var t=$(e.target).closest("p, .flow, .speech > *")
if(t.prev().prev().hasClass("flow")&&t.prev().prev().find("textarea").focus(),t.prev().hasClass("flow"))t.prev().find("textarea").focus()
else if(t.hasClass("flow"))t.find("textarea").focus()
else{var n=$("<div class='flow'><textarea class='flow-text'></textarea> <div class='icon-flow-tree flow-toggle'></div>   <div class='flow-link icon-flow-parallel'  data-placement='left' title='Click Flow Anchor, then select a response in another speech to scroll to, when you hover over this flow entry'></div></div>")
n.insertBefore(t),n.find("textarea").focus(),$("[title]").tooltip()}}),$("#round").on("click",".flow-link",function(){var e=$(this)
e.toggleClass("active-link"),e.hasClass("active-link")&&($(".active-speech").addClass("flow-link-selecting-mode"),$(".active-speech > *").on("mousedown",function(){$(".active-speech > *").off("mousedown"),$(".active-speech").removeClass("flow-link-selecting-mode")
var t=Math.floor(1e3*Math.random())
e.data("flow-anchor",t),$(this).addClass("flow-anchor-"+t)}))}),$("#round").on("scroll",".speech",function(){}),$("#round").on("mouseover mousemove",".flow-link",function(){var e=$(this)
if(e.hasClass("active-link")){var t=$(".flow-anchor-"+e.data("flow-anchor"))
t.css("background-color","lightblue"),setTimeout(function(){t.css("background-color","")},1e3)
var n=t.closest(".speech")
n.scrollTop(n.scrollTop()-e.offset().top+t.offset().top)}}),$("#round").on("click",".flow-toggle",function(){var e=$(this)
if(e.hasClass("flow-collapsed"))for(e.removeClass("flow-collapsed fa-chevron-circle-right").addClass("fa-chevron-circle-down"),e=e.parent();e.next().length&&!e.next().hasClass("flow");)e=e.next(),e.show()
else for(e.addClass("flow-collapsed  fa-chevron-circle-right").removeClass("fa-chevron-circle-down"),e=e.parent();e.next().length&&!e.next().hasClass("flow");)e=e.next(),e.hide()}),$("#round").on("change keyup cut paste",".flow-text",function(){$(this).height("30px").height(this.scrollHeight)
var e=$(this).val()
console.log(e),e.length||$(this).parent().remove()}),$("#round").on("blur",".flow-text",function(){var e=$(this).val()
e.length||$(this).parent().remove()})}window.docShareAlert=function(e){$("#info").append('<div class="alert alert-success alert-dismissable"><button  class="close" data-dismiss="alert">&times;</button>'+e.owner+' has shared "'+e.title+'" with you. <button data-dismiss="alert" class="btn btn-xs btn-primary">Accept</button></div>').on("close.bs.alert",".alert",function(){$.get("/user/notify",{fileId:e.fileId})}).on("click",".btn-primary",function(){ft.click(e.fileId),window.location.pathname="/"+e.fileId})},window.alert=function(e,t,n,i){var o=$('<div class="alert-'+(t||"info")+'">'+(i?"":'<span class="close"></span>')+(e||"")+"</div>")
return n=n||"#sidebar",$($(n+">.alert-position")[0]||$("<div class='alert-position'>").prependTo(n)).prepend(o),i?o.hide().fadeIn(300).delay(1500).closeAlert():o.find(".close").click(function(){$(this).parent().closeAlert()}),o},jQuery.fn.closeAlert=function(){this.animate({opacity:0,"margin-top":"-50px",display:"none"},"fast").delay(300,function(){this.remove()})},window.roundInviteAlert=function(e){alert("You have been invited into a round with "+e.people+'. <button data-dismiss="alert" class="btn btn-xs btn-primary">Accept</button>',"success").find(".btn-primary").click(function(){r={_id:e.roundId},$.get("/round/accept",{roundId:e.roundId},startRound)})},$(document).ready(function(){setTimeout(function(){$(".modal").css("left",$("#sidebar").width()+35+"px"),$(".modal").each(function(){$(this).prepend('<span class="close">')}),$(".modal-overlay, .close").click(function(e){$(".modal").hide()})},4e3)}),window.chunk=!0,NodeList.prototype.forEach=Array.prototype.forEach
var ft={init:function(e,t){ft.root=$(e),ft.dragging=!1,ft.selected={},ft.populate(e,t),$("#filetree").on("click","ul,li",ft.click),$("#filetree").on("click","label",function(e){var t=$(this).parent()
t.toggleClass("collapsed")}),$("#filetree").scroll(function(){this.scrollLeft=0}),$("#filetree").mousemove(function(e){clearTimeout(window.fisheye),window.fisheye=setTimeout(function(){e.originalEvent.clientY>filetree.getBoundingClientRect().bottom-30?(filetree.scrollTop+=15,filetree.style.cursor="s-resize"):e.originalEvent.clientY<filetree.getBoundingClientRect().top+20?(filetree.scrollTop-=15,filetree.style.cursor="n-resize"):filetree.style.cursor="initial"},50)}).mouseleave(function(e){clearTimeout(window.fisheye)}),ft.updateNeeded=!1,$("#docs").keyup(function(e){ft.updateNeeded=!0,$(window.getSelection().anchorNode).closest("h1,h2,h3").length&&(ft.updateNeeded=!0)})},populate:function(e,t){function n(e){var t=""
for(var i in e){var o=e[i],a=""
o.type=(o.type||"").replace(/heading /g,"h ").replace(/heading-/g,"").replace(/ft-/g,""),o.children||"file"!=o.type||(o.type="file collapsed"),o.type.indexOf("file")>-1&&(a="<ul draggable class='"+o.type+"' id='"+o.id+"'><label>"+o.title+"</label>"),o.type.search(/h\d/i)>-1&&(a="<li draggable class='"+o.type+"'><label>"+o.title+"</label>"),o.children&&o.children.length&&(a+=n(o.children)),o.type.indexOf("file")>-1&&(a+="</ul>"),o.type.search(/h\d/i)>-1&&(a+="</li>"),t+=a}return t}ft.root&&e[0]&&e[0].id==ft.root[0].id,outputHTML=n(t),e.append(outputHTML)},toJSON:function(e){"undefined"==typeof e&&(e=filetree)
var t=[]
return $(e).children("ul").each(function(){var e=$(this),n={id:e.attr("id"),title:e.children("label").text(),type:e.attr("class")}
t.push(n)}),t},update:function(){if(u.index=ft.toJSON(),ft.selected&&$("#doc-"+ft.selected.id).length&&ft.updateNeeded&&ft.selected.id==$("#doc-"+ft.selected.id).attr("id").substring(4)){var e=[],t=0,n=-1
$("#doc-"+ft.selected.id)[0].querySelectorAll("h1, h2, h3").forEach(function(i){$(i).text().length>2&&e.push({id:ft.selected.id+"_"+t.toString(),title:$(i).text().substring(0,50),type:$(i).prop("tagName").toLowerCase()+(n==t?" selected":"")}),t++})
for(var t in u.index)if(u.index[t].id==ft.selected.id){u.index[t].children=e
break}$("#"+ft.selected.id).find("li").remove(),ft.populate($("#"+ft.selected.id),e),$.post({url:"/doc/update",contentType:"application/json",data:JSON.stringify({text:$("#doc-"+ft.selected.id).html(),id:ft.selected.id})})}},updateIndex:function(){u.index.length&&u.name&&$.post({url:"/user/update",data:JSON.stringify({userid:u._id,index:u.index}),contentType:"application/json"})},click:function(e){function t(){for(var e=$("#doc-"+ft.selected.id).find("h1, h2, h3"),t=0;t<e.length;t++)if(e[t].textContent.length<3)e.splice(t--,1)
else if(t==a)break
e[t].scrollIntoView(),$("#doc-"+ft.selected.id).scrollTop($("#doc-"+ft.selected.id).scrollTop()-260)}e.stopPropagation()
var n="string"==typeof e?$("#"+e):$(e.currentTarget)
if($(".selected").removeClass("selected"),n.attr("class").search(/h\d/i)>-1){var i=n.parent(),o=i.attr("id")
window.preloadHeading=n.find("label").text()
var a=i.find("li").index(n)
console.log(a),ft.selected.id==o?t():loadFile(o,t)}else n.hasClass("file")&&loadFile(n.attr("id"))}}
$(document).ready(function(){$("body").on("touchstart",function(e){window.touchStart=e.originalEvent.changedTouches[0].pageX}).on("touchend",function(e){var t=window.touchStart?e.originalEvent.changedTouches[0].pageX-window.touchStart:0;-100>t?($("#sidebar").animate({marginLeft:"-"+$("#sidebar").width()},0),$("#docs").animate({paddingLeft:"0"},0)):t>100&&($("#sidebar").animate({marginLeft:"0"},0),$("#docs").animate({paddingLeft:"20%"},0))}),window.innerWidth<=800,window.dragSidebar=!1,$("#sidebar").on("mousemove",function(e){$(this).width()-e.offsetX<10?$("body").css("cursor","e-resize"):dragSidebar||$("body").css("cursor","")}).on("mouseout",function(e){dragSidebar||$("body").css("cursor","")}).on("mousedown touchstart",function(e){var t=e.originalEvent.touches?e.originalEvent.touches[0].clientX:e.offsetX
$("#sidebar").width()-t>20||(dragSidebar=!0,$("body").on("mousemove touchmove",function(e){e.preventDefault()}).on("mouseup",function(e){$("body").off("mousemove mouseup touchend touchmove"),dragSidebar&&(dragSidebar=!1,e=e.originalEvent.touches?e.originalEvent.changedTouches[0]:e,$("#sidebar").css("max-width",e.pageX+"px"),$.post("/user/update",{options:{sidebar:e.pageX}}))}).on("touchend",function(e){$("body").off("mousemove mouseup touchend touchmove"),dragSidebar&&(dragSidebar=!1,e=e.originalEvent.touches?e.originalEvent.changedTouches[0]:e,$("#sidebar").css("max-width",e.pageX+"px"),$.post("/user/update",{options:{sidebar_mobile:e.pageX}}))}))})})
var xPos=null,yPos=null
window.addEventListener("touchmove",function(e){var t=e.touches[0]
return oldX=xPos,oldY=yPos,xPos=t.pageX,yPos=t.pageY,null==oldX&&null==oldY?!1:Math.abs(oldX-xPos)>Math.abs(oldY-yPos)?(e.preventDefault(),!1):void 0}),$(window).keydown(function(e){83==e.which&&e.ctrlKey&&(e.preventDefault(),ft.update()),e.keyCode>=112&&e.keyCode<120?(e.preventDefault(),$("#controls button")[e.keyCode-112].click()):27==e.keyCode&&$("#searchtext").select2("open")}),$(window).on("beforeunload",function(){})
var r={}
$(document).ready(initRoundPanel),initSockets(),$(document).ready(initTimer)
var sidebarHtml='<aside id="sidebar"> <div id="controls"> <select id="searchtext"></select> <button id="format-highlight" class="icon-sw-highlighter" title="Highlight underlined read card text"></button> <button id="readcard" title="Read text" class="icon-underline"></button> <button id="block" title="Heading" class="icon-header"></button> <button id="read" title="Bold" class="icon-bold"></button> <button id="format-remove" title="Clear formatting" class="icon-eraser"></button> <button id="showfileinfo" title="File Info &amp; Sharing" class="icon-share"></button> <button id="file-new" title="New File" class="icon-doc-new"></button> <button id="showsettings" title="Settings" class="icon-sliders"></button> <button id="showround" title="Round"></button> <div class="dropdown"> <button class="icon-ellipsis-vert"></button> <div class="dropdown-menu"> <button id="ft-minimize-unread" class="icon-fontsize"> Minimize Unread Text</button> <button id="ft-collapse" class="icon-tree"> Collapse Filetree</button> </div> </div> </div> <div id="filetree"></div> </aside>'
$(document).ready(function(){$(sidebarHtml).prependTo("body"),$(".btn").click(function(){$(this).blur()}),$("#block").click(function(){var e="h1",t=$(window.getSelection().anchorNode.parentNode).closest("h1")
t.length>0?t[0].outerHTML=t.html():!document.execCommand("formatBlock",!1,e),document.execCommand("formatBlock",!1,"<"+e+">")}),$("#read").click(function(){document.execCommand("bold")}),$("#readcard").click(function(){document.execCommand("underline")}),$("body").on("mouseup",".highlight-mode",function(e){var t=getSelection().getRangeAt(0).cloneContents()
!t.querySelector("b,u")&&t.textContent.length>50&&alert("Only bold or underlined text in selection gets highlighted.","warning",null,!0)
var n=getSelection().anchorNode.parentNode
n.closest("mark")
return $("#docs").toggleClass("strikeToggleMode"),$("mark").each(function(){}),document.execCommand("italic"),$("strike").each(function(){}),$("#docs").toggleClass("strikeToggleMode"),$("#docs *[style*='font-style: italic']").css("font-style","normal").wrap("<i>"),void getSelection().collapseToStart()
var t}),$("#format-highlight").click(function(){$("#docs").on("mouseenter",function(){$("#docs").off("mouseenter"),$("#format-highlight").hasClass("active")&&sw.play()}),$(this).toggleClass("active"),$("#docs, .speech").toggleClass("highlight-mode").trigger("mouseup")}),$("#format-remove").click(function(){var e=window.getSelection().getRangeAt(0),t=e.toString(),n=document.createElement("span")
n.innerHTML="</b></u></h1></h4></span>"+t,e.deleteContents(),e.insertNode(n)}),$("#ft-collapse").click(function(){$(".file:not(.collapsed)").addClass("collapsed")}),$("#ft-minimize-unread").click(function(){$("#docs").hasClass("size-mode-1")?$("#docs, .speech").addClass("size-mode-0").removeClass("size-mode-1"):$("#docs, .speech").addClass("size-mode-1").removeClass("size-mode-0"),$("#ft-minimize-unread .fa-margin").toggleClass("fa-check-square-o").toggleClass("fa-square-o")}),$("#big").click(function(){window.setTimeout(function(){$(".ft-selected").click()},1e3),u.big=u.big?2==u.big?0:2:1
for(var e=$(".tab-content .active p"),t=0;t<e.length&&!(e[t].getBoundingClientRect().top>0);t++);0==u.big?($(".doc:visible, .speech").find("*[style]").filter(function(){return"rgba(0, 0, 0, 0)"!=$(this).css("background-color")}).css("font-size","").css("line-height",""),$("#docs, .speech").find("*[style*='yellow'], b, u, h1").css("font-size","").css("line-height",""),$(".doc:visible, .speech").css("font-size","100%")):1==u.big?($(".doc:visible, .speech").find("*[style]").filter(function(){return"rgba(0, 0, 0, 0)"!=$(this).css("background-color")}).css("font-size","30pt").css("line-height","100%"),$(".doc:visible, .speech").find("*[style*='yellow'], b, u, h1").css("font-size","30pt").css("line-height","100%"),$(".doc:visible, .speech").css("font-size","30%")):2==u.big&&$(".doc:visible, .speech").find("u").css("font-size","").css("line-height","")}),$("#showround").click(function(){$("#round").is(":visible")?($("#round").hide(),$("#docs").css("padding-right",0)):(openRoundPanel(),$("#docs").css("padding-right","45%"))})}),$(window)[0].addEventListener("paste",function(e){return},!0),$(document).ready(function(){$("#filetree").on("dragstart",function(e){ft.dragging=$(e.target).closest("nav"),$(e.target).addClass("ft-being-dragged")}),$(document).on("dragover",function(e){e.preventDefault()}),$("#filetree").on("dragenter",function(e){e=$(e.target).closest("nav"),e&&e.addClass("ft-dragged-over")}).on("dragleave",function(e){e=$(e.target).closest("nav"),e&&e.removeClass("ft-dragged-over")}).on("drop",function(e){if(!e.originalEvent.dataTransfer||!e.originalEvent.dataTransferuls.length){e.preventDefault()
var t=$(e.target).closest("li,ul")
if(t.length){var n=t.attr("class").match(/(file|folder|heading)/gi)
n=n.length?n[0]:!1,t.removeClass("ft-dragged-over").css("color","none")}if(ft.dragging.removeClass("ft-being-dragged"),console.log(ft.dragging),console.log(t),t.length){if(ft.dragging.find(".ft-name").hasClass("folder")||ft.dragging.find(".ft-name").hasClass("ft-file"))if("folder"==n&&e.originalEvent.clientX>30)t.find(".ft-list").length||t.append("<div class='ft-list'>"),t.find(".ft-list").append(ft.dragging)
else{if("folder"!=n&&"ft-file"!=n)return
t.after(ft.dragging)}else if(ft.dragging.find(".ft-name").hasClass("heading")){if("ft-file"==n)t.find(".ft-list").length||t.append("<div class='ft-list'>"),t.find(".ft-list").append(ft.dragging)
else{if("heading"!=n)return
t.after(ft.dragging)}var i=ft.dragging.find(".ft-name").attr("id")
i=parseInt(i.substring(i.indexOf("_")+1))
var o=parseInt(t.find(".ft-name").attr("id").substring(t.find(".ft-name").attr("id").indexOf("_")+1)),a=$("#doc-"+ft.selected.id).find("h1,h2,h3"),s=a.eq(o+1),l=a.eq(i)[0],c=a.eq(1+i).prev()[0],r=document.createRange()
r.selectNodeContents(l),r.setEnd(c,c.childNodes.length)
var d=$("<span>")
d.append(r.extractContents()),console.log(d.html()),s.before(d)}}else $("#filetree > .ft-list > .ft-item:last").after(ft.dragging)
$(".ft-being-dragged:first").closest(".ft-item").remove(),u.index=ft.toJSON(),ft.updateIndex()}})}),function(e,t,n,i,o,a,s){e.GoogleAnalyticsObject=o,e[o]=e[o]||function(){(e[o].q=e[o].q||[]).push(arguments)},e[o].l=1*new Date,a=t.createElement(n),s=t.getElementsByTagName(n)[0],a.async=1,a.src=i,s.parentNode.insertBefore(a,s)}(window,document,"script","https://www.google-analytics.com/analytics.js","ga"),ga("create","UA-79203150-1","auto"),ga("send","pageview"),$(document).ready(function(){function e(e){u.index&&u.index.filter(function(t){return t.id==e}).length&&ft.selected.id!=e?$("#"+e).click():loadFile(decodeURIComponent(e).replace(/[\W]+/g,""))}if(u){var t=$("<style>").appendTo("head")
t.html(u.custom_css)
var n=$("<script id='custom_script'>").html(u.custom_js)
n.appendTo("head"),u.options&&u.options.sidebar&&$("#sidebar").css("max-width",u.options.sidebar+"px"),u.options&&3==u.options.debatetype&&($(".nav-item:has(.nav-link[href='#speech2AC']), .nav-item:has(.nav-link[href='#speech2NC']), .nav-item:has(.nav-link[href='#speech1NR'])").remove(),$(".nav-link[href='#speech1AC']").text("AC"),$(".nav-link[href='#speech1NC']").text("NC"),$(".nav-link[href='#speech2NR']").text("NR"),$("#aff2+span,#neg2+span").hide())
for(var i in u.notifications)"round_youAreInvited"==u.notifications[i].type?roundInviteAlert(u.notifications[i]):"doc_share"==u.notifications[i].type&&docShareAlert(u.notifications[i])}else $('<button type="submit" id="login">Sign In</button>').prependTo("#sidebar").click(function(){location.href="/login"}),location.pathname.length<2?(o=1,u={index:JSON.parse('[{"id":"manual","title":"Debate Synergy Manual","type":"file selected","children":[{"title":"Welcome to Debate Synergy","type":"h h1"},{"title":"Manual","type":"h h1"},{"title":"Debate Sidebar Word AddIn ","type":"h h1"}]}]')}):u={index:[]}
$("head").append('<link rel="chrome-webstore-item" href="https://chrome.google.com/webstore/detail/noecbaibfhbmpapofcdkgchfifmoinfj">'),"local"==u.index,ft.init($("#filetree"),u.index)
var o=window.loadResourcesDelay||3e3
setTimeout(function(){$.get("/html/interface.panels.html",function(e){$("body").append(e),initRoundPanel(),initRoundActions(),initTimer(),initControls(),initFlow(),!u.name&&location.pathname.length<2&&$("#showround").click()})},o),$(window).on("popstate",loadFile)
var a=location.pathname.substr(1)
a&&"#"!=a?e(a):u.name&&"manual"!=u.index[0].id?$(".selected,.opened").length?loadFile($(".selected,.opened").eq(0).attr("id")):$(".file:first").click():($("#manual:first").click(),window.scrollTo(0,0))}),window.chrome&&window.chrome.runtime,1,$(document).ready(initFlow),$(document).ready(function(){$("#searchtext").select2({ajax:{url:"/doc/search",dataType:"json",delay:50,data:function(e){return $("#searchtext").data("term",e.term),{q:e.term}},processResults:function(e,t){var n=t.term.toLowerCase().split(" "),i=u.index,o=u.index.map(function(e){return e.children||[]})
for(var a in o)i=i.concat(o[a])
i=i.map(function(e){return{id:e.id,text:e.title}})
for(var a in n)i=i.filter(function(e){return e.text.toLowerCase().indexOf(n[a])>-1})
return e=i.concat(e),{results:e}},cache:!0},minimumInputLength:1,escapeMarkup:function(e){return e},templateResult:function(e){return e.matchedString?"<span style='font-size: 80%'><b>"+e.text+"</b> <br><span style='font-size: 70%'>"+e.matchedString.replace(/<[^>]*>/gi,"")+"</span></span>":"<span><b>"+e.text+"</b> </span>"}}).on("select2:select",function(e){console.log(e.params.data),ft.click(e.params.data.id)
var t=$("#searchtext").data("term"),n=function(){t&&window.find(t,0,0,0,0,0,1),getSelection().anchorNode&&getSelection().anchorNode.parentNode.scrollIntoView()}
setTimeout(n,1500)})}),$("#sidebar, #docs").on("drop",function(e){e=e.originalEvent
var t=e.dataTransfer?e.dataTransfer.files:[]
if(t.length){e.preventDefault()
var n={type:"ft-file ft-selected",title:t[0].name.replace(".docx",""),text:""}
$.get("/doc/create",n,function(e){n.id=e,u.index.push(n),ft.populate($("#filetree"),u.index),loadFile(e)}).then(function(){var e=new FileReader
e.onload=function(e){function t(e,t){var n=$((new DOMParser).parseFromString(t.replace(/<w:/g,"<").replace(/<\/w:/g,"</"),"text/xml")),o=(new DOMParser).parseFromString(e.replace(/<[a-zA-Z]*?:/g,"<").replace(/<\/[a-zA-Z]*?:/g,"</"),"text/xml").firstChild.getElementsByTagName("body")[0],a=document.createElement("body")
for(i=0;inNode=o.childNodes[i];i++){var s=document.createElement("p")
for(j=0;inNodeChild=inNode.getElementsByTagName("r")[j];j++){var l=$(inNodeChild).text(),c=inNodeChild.getElementsByTagName("rStyle")[0]
if(c){var r=n.find("*[w\\:styleId='"+c.getAttribute("w:val")+"']")[0]
r&&inNodeChild.appendChild(r.cloneNode(!0))}inNodeChild.getElementsByTagName("b").length&&(l="<b>"+l+"</b>"),inNodeChild.getElementsByTagName("u").length&&(l="<u>"+l+"</u>"),inNodeChild.getElementsByTagName("highlight").length&&(l='<span style="background-color:'+inNodeChild.getElementsByTagName("highlight")[0].getAttribute("w:val")+'">'+l+"</span>"),s.innerHTML+=l}var c=inNode.getElementsByTagName("pPr").length?inNode.getElementsByTagName("pPr")[0].getElementsByTagName("pStyle")[0]:!1
if(c){var r=n.find("*[w\\:styleId='"+c.getAttribute("w:val")+"']")[0]
if(r&&(r.getElementsByTagName("b").length&&(s.innerHTML="<b>"+s.innerHTML+"</b>"),r.getElementsByTagName("u").length&&(s.innerHTML="<u>"+s.innerHTML+"</u>"),r.getElementsByTagName("outlineLvl").length)){var d=r.getElementsByTagName("outlineLvl")[0].getAttribute("w:val")
s.innerHTML="<h"+(parseInt(d)+1)+">"+s.innerHTML+"</h"+(parseInt(d)+1)+">"}}a.appendChild(s)}setTimeout(function(){$(".doc:visible").html(a.innerHTML)},300)}var n,o,a=e.target.result,s=new JSZip
s.loadAsync(a).then(function(e){return e.file("word/document.xml").async("string")}).then(function(e){n=e,s.loadAsync(a).then(function(e){return e.file("word/styles.xml").async("string")}).then(function(e){o=e,t(n,o)})})},e.readAsBinaryString(t[0])})}})
