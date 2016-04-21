//var u = {};
var local;

//save file before closing tab
$( window ).on('beforeunload', function() {

  //ft.update();
});



  $("body").on("scroll", function(){
    //$("body").scrollTop(0)
  })

//logged out, but can force login re-auth
if (!u && document.cookie.indexOf("debatesynergylogin=") > -1) {
  //window.location.pathname = '/auth';
}

$(document).ready(function() {

//if user logged in, initiallize settings and index
if (u) {

  //minimize unread by default
  $("#ft-minimize-unread").click();

  var customCSS = $("<style>").appendTo('head');
  customCSS.html(u.custom_css)

  var customJS = $("<script id='custom_script'>").html(u.custom_js);
  customJS.appendTo('body');

  if (u.options && u.options.sidebar)
      $("#sidebar").css('max-width', u.options.sidebar+'px');

  //LD
  if (u.options &&  u.options.debatetype==3){

    $(".nav-item:has(.nav-link[href='#speech2AC']), .nav-item:has(.nav-link[href='#speech2NC']), .nav-item:has(.nav-link[href='#speech1NR'])").remove()

    $(".nav-link[href='#speech1AC']").text("AC")
    $(".nav-link[href='#speech1NC']").text("NC")

    $(".nav-link[href='#speech2NR']").text("NR")
    $("#aff2+span,#neg2+span").hide()

  }

  for (var n in u.notifications)
    if(u.notifications[n].type=="round_youAreInvited")
      roundInviteAlert(u.notifications[n])
    else if (u.notifications[n].type=="doc_share")
      docShareAlert(u.notifications[n])


  $('head').append('<script type="text/javascript" src="https://apis.google.com/js/client.js?onload=gapiInit"></script>')


} else { //no user, show default page

  //google sign in
  $("#auth").show()

  //round panel
  $("#showround").click()

  u = {index: JSON.parse('[{"id":"home","title":"Debate Synergy Manual","type":"ft-file ft-selected","children":[{"id":"home_0","title":"Welcome to Debate Synergy",'+
  '"type":"heading heading-h1"},{"id":"home_1","title":"Manual ","type":"heading heading-h1"},{"id":"home_2","title":"Debate Sidebar Word AddIn ","type":"heading heading-h1"}]}]') };

//    u ={index: JSON.parse(localStorage.getItem("index"))}

};

//init filetree
ft.init($('#filetree'), u.index);

//click file tree last selected
if ($('.ft-selected').length){
  var fileId = $('.ft-selected').closest('.ft-item:has(.ft-file)').find('.ft-file').attr('id')
  ft.loadFile(fileId, function(){


    $('.ft-selected').click();
    $("#loading-screen").remove()
  })
}else {
  $('.ft-item:first').click();
}

//reset scrolls
window.scrollTo(0,0)



//URL fileID change to load debate file
//TODO back fwd overrites hisory non sequential because of push state on back button

function loadHash() {
  var id = location.pathname.substr(1);

  if (id && $('#' + id).length && ft.selected.id != id) {
    $('#' + id).click();
  } else if (id == "home") {
      ft.loadFile(id)
    $(".doc").hide();
    $("#doc-home").show()
  } else if (id){
      $(".doc").hide();
    ft.loadFile(id)
  }
}

$(window).on('popstate', loadHash);
if (location.pathname.length > 3)
  loadHash();



// FULL-TEXT FILE SEARCH BOX

$("#searchtext").select2({
  ajax: {
        url: "/doc/search",
        dataType: 'json',
        delay: 50,
        data: function (params) {
          $("#searchtext").data("term", params.term);
          return {q: params.term};
        },
        processResults: function (data, params) {

          var terms = params.term.toLowerCase().split(" ");

          var finalList = u.index,  flatList =  u.index.map(function(f){ return f.children || [];})

          for (var i in flatList)
            finalList = finalList.concat( flatList[i] );

          finalList = finalList.map(function(f){ return {id: f.id, text: f.title}; });


            //filter data to only searched words
            for (var i in terms)
              finalList = finalList.filter(function(d){ return d.text.toLowerCase().indexOf(terms[i])>-1; })

            data = finalList.concat(data);
          return {results: data};

        },
        cache: true
      },
       minimumInputLength: 1,
       escapeMarkup: function (markup) { return markup; },
       templateResult: function  (sel) {

          return sel.matchedString ? "<span style='font-size: 80%'><b>" +sel.text + "</b> <br>" + "<span style='font-size: 70%'>"+sel.matchedString.replace(/<[^>]*>/gi, "") + "</span></span>" : "<span><b>" +sel.text + "</b> " + "</span>";
        }
}).on("select2:select", function (e) {
  console.log(e.params.data);

  ft.click(e.params.data.id)

  var q = $("#searchtext").data("term");
  var findTerm = function(){

    if (q)
        window.find(q ,0,0,0,0,0,1);
    if ( getSelection().anchorNode )
      getSelection().anchorNode.parentNode.scrollIntoView
  }

  //ft.loadFile(e.params.data.id, findTerm)
  setTimeout(findTerm, 1500)


});




//MOBILE: swipe to toggle sidebar
$('body').on('touchstart', function(e) {
window.touchStart = e.originalEvent.changedTouches[0].pageX;
}).on('touchend', function(e) {
var dist = window.touchStart ? e.originalEvent.changedTouches[0].pageX - window.touchStart : 0;

if (dist < -100) {
  $("#sidebar").animate({
    'marginLeft': "-"+$("#sidebar").width()
  }, 250);
} else if (dist > 100){
  $("#sidebar").animate({
    'marginLeft': '0'
  }, 250);
}
})

if ($(document).width() < 700) {

}





//SIDEBAR resizable
window.dragSidebar = false;
$("#sidebar").on('mousemove',function(e){
  if($(this).width() - e.offsetX < 10)
      $("body").css('cursor','e-resize');
  else if(!dragSidebar)
       $("body").css('cursor','');
})
.on('mouseout',function(e){
if(!dragSidebar)
    $("body").css('cursor','');
})
.on('mousedown touchstart',function(e){
  var start = e.originalEvent.touches ? e.originalEvent.touches[0].clientX : e.offsetX;
  if($("#sidebar").width() - start > 20)
    return;


  dragSidebar = true;

  $("body").on('mousemove touchmove',function(e){
     e.preventDefault();
  })
  .on('mouseup',function(e){
    $("body").off('mousemove mouseup touchend touchmove');

    if (dragSidebar){
        dragSidebar = false;
        e = e.originalEvent.touches ? e.originalEvent.changedTouches[0] : e;

        $("#sidebar").css('max-width',e.pageX+'px');
        $.post("/user/update", {options: {sidebar: e.pageX }});
    }
  })
  .on('touchend',function(e){
    $("body").off('mousemove mouseup touchend touchmove'); //swipe conflict

    if (dragSidebar){
        dragSidebar = false;
        e = e.originalEvent.touches ? e.originalEvent.changedTouches[0] : e;

        $("#sidebar").css('max-width',e.pageX+'px');
        $.post("/user/update", {options: {sidebar_mobile: e.pageX }});
    }
  })


});



//window.off=true;
window.chunk=true;

//key shortcuts F1-F8
$(window).keydown(function(e) {

if(e.which==83&&e.ctrlKey){
  e.preventDefault();

  window.off=false;
  ft.update();
  ft.updateIndex();
//  window.off=1
  ;

}



if (e.keyCode >= 112 && e.keyCode < 120) { //F1-F8
  e.preventDefault();
  $("#controls button")[e.keyCode - 112].click();
} else if (e.keyCode == 27) //ESC
  $("#searchtext").select2("open");

})

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
$("#docs")[0].addEventListener("paste", function(e) {
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

//DOCX TO HTML SUPPORT: drop docx on page to convert to debate-ready html and added for user
$("#sidebar, #docs").on("drop", function(e) {
  e = e.originalEvent;
  var files = e.dataTransfer ? e.dataTransfer.files : [];
  if (!files.length)
    return;

  //suppress browser "download" of file
  e.preventDefault();


  //create new docx doc in the filetree
  var fileData = {"type": "ft-file ft-selected", "title": files[0].name.replace(".docx",""),  "text": "" };


  $.get("/doc/create", fileData, function(id) {
    fileData.id = id;
    u.index.push(fileData);
    ft.populate($("#filetree"), u.index);
    ft.loadFile(id);
  }).then(function(){


    //unzip docx and convert document and styles from binary to Unicode  ascii //TODO utf8 longdash error
    var docx2html = function(stream) {


      var currentByteIndex = 0,  data = 1,  fileName, compressedSize, fileNameLength, extraFieldLength, doc, style;

      var getNextBytesAsNumber = function(steps) {
        var index = currentByteIndex,  result = 0,  i = index + steps - 1;
        while (i >= index) {
          result = (result << 8) + stream.charCodeAt(i);
          i--;
        }
        currentByteIndex += steps;
        return result;
      }

      var getNextBytesAsString = function(steps) {
        var index = currentByteIndex,   result = "",   max = index + steps,  i = index;
        while (i < max) {
          var charCode = stream.charCodeAt(i);
          result += String.fromCharCode(charCode);
          i++;
        }
        currentByteIndex += steps;
        return result;
      }

      //decompress() zip github.com/augustl/js-inflate
      var n=32768;var w=0;var I=1;var i=2;var S=9;var h=6;var t=32768;var a=64;var C;var k;var Q=null;var b;var M,D;var s;var r;var U;var N;var T;var y;var m,p;var f,j;var B;var E;var P=new Array(0,1,3,7,15,31,63,127,255,511,1023,2047,4095,8191,16383,32767,65535);var c=new Array(3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0);var L=new Array(0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,99,99);var J=new Array(1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577);var z=new Array(0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13);var q=new Array(16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15);function x(){this.next=null;this.list=null}function H(){this.e=0;this.b=0;this.n=0;this.t=null}function l(ax,al,ag,av,au,aq){this.BMAX=16;this.N_MAX=288;this.status=0;this.root=null;this.m=0;var ay;var aw=new Array(this.BMAX+1);var V;var at;var ar;var ap;var ao;var an;var am;var W=new Array(this.BMAX+1);var aj;var X;var ai;var ah=new H();var af=new Array(this.BMAX);var ae=new Array(this.N_MAX);var ad;var ab=new Array(this.BMAX+1);var ac;var aa;var Z;var ak;var Y;Y=this.root=null;for(ao=0;ao<aw.length;ao++){aw[ao]=0}for(ao=0;ao<W.length;ao++){W[ao]=0}for(ao=0;ao<af.length;ao++){af[ao]=null}for(ao=0;ao<ae.length;ao++){ae[ao]=0}for(ao=0;ao<ab.length;ao++){ab[ao]=0}V=al>256?ax[256]:this.BMAX;aj=ax;X=0;ao=al;do{aw[aj[X]]++;X++}while(--ao>0);if(aw[0]==al){this.root=null;this.m=0;this.status=0;return}for(an=1;an<=this.BMAX;an++){if(aw[an]!=0){break}}am=an;if(aq<an){aq=an}for(ao=this.BMAX;ao!=0;ao--){if(aw[ao]!=0){break}}ar=ao;if(aq>ao){aq=ao}for(aa=1<<an;an<ao;an++,aa<<=1){if((aa-=aw[an])<0){this.status=2;this.m=aq;return}}if((aa-=aw[ao])<0){this.status=2;this.m=aq;return}aw[ao]+=aa;ab[1]=an=0;aj=aw;X=1;ac=2;while(--ao>0){ab[ac++]=(an+=aj[X++])}aj=ax;X=0;ao=0;do{if((an=aj[X++])!=0){ae[ab[an]++]=ao}}while(++ao<al);al=ab[ar];ab[0]=ao=0;aj=ae;X=0;ap=-1;ad=W[0]=0;ai=null;Z=0;for(;am<=ar;am++){ay=aw[am];while(ay-->0){while(am>ad+W[1+ap]){ad+=W[1+ap];ap++;Z=(Z=ar-ad)>aq?aq:Z;if((at=1<<(an=am-ad))>ay+1){at-=ay+1;ac=am;while(++an<Z){if((at<<=1)<=aw[++ac]){break}at-=aw[ac]}}if(ad+an>V&&ad<V){an=V-ad}Z=1<<an;W[1+ap]=an;ai=new Array(Z);for(ak=0;ak<Z;ak++){ai[ak]=new H()}if(Y==null){Y=this.root=new x()}else{Y=Y.next=new x()}Y.next=null;Y.list=ai;af[ap]=ai;if(ap>0){ab[ap]=ao;ah.b=W[ap];ah.e=16+an;ah.t=ai;an=(ao&((1<<ad)-1))>>(ad-W[ap]);af[ap-1][an].e=ah.e;af[ap-1][an].b=ah.b;af[ap-1][an].n=ah.n;af[ap-1][an].t=ah.t}}ah.b=am-ad;if(X>=al){ah.e=99}else{if(aj[X]<ag){ah.e=(aj[X]<256?16:15);ah.n=aj[X++]}else{ah.e=au[aj[X]-ag];ah.n=av[aj[X++]-ag]}}at=1<<(am-ad);for(an=ao>>ad;an<Z;an+=at){ai[an].e=ah.e;ai[an].b=ah.b;ai[an].n=ah.n;ai[an].t=ah.t}for(an=1<<(am-1);(ao&an)!=0;an>>=1){ao^=an}ao^=an;while((ao&((1<<ad)-1))!=ab[ap]){ad-=W[ap];ap--}}}this.m=W[1];this.status=((aa!=0&&ar!=1)?1:0)}function e(){if(B.length==E){return -1}return B.charCodeAt(E++)&255}function R(V){while(r<V){s|=e()<<r;r+=8}}function u(V){return s&P[V]}function d(V){s>>=V;r-=V}function g(aa,Y,W){var X;var V;var Z;if(W==0){return 0}Z=0;for(;;){R(f);V=m.list[u(f)];X=V.e;while(X>16){if(X==99){return -1}d(V.b);X-=16;R(X);V=V.t[u(X)];X=V.e}d(V.b);if(X==16){k&=n-1;aa[Y+Z++]=C[k++]=V.n;if(Z==W){return W}continue}if(X==15){break}R(X);T=V.n+u(X);d(X);R(j);V=p.list[u(j)];X=V.e;while(X>16){if(X==99){return -1}d(V.b);X-=16;R(X);V=V.t[u(X)];X=V.e}d(V.b);R(X);y=k-V.n-u(X);d(X);while(T>0&&Z<W){T--;y&=n-1;k&=n-1;aa[Y+Z++]=C[k++]=C[y++]}if(Z==W){return W}}U=-1;return Z}function v(Y,W,V){var X;X=r&7;d(X);R(16);X=u(16);d(16);R(16);if(X!=((~s)&65535)){return -1}d(16);T=X;X=0;while(T>0&&X<V){T--;k&=n-1;R(8);Y[W+X++]=C[k++]=u(8);d(8)}if(T==0){U=-1}return X}function K(aa,Z,X){if(Q==null){var W;var V=new Array(288);var Y;for(W=0;W<144;W++){V[W]=8}for(;W<256;W++){V[W]=9}for(;W<280;W++){V[W]=7}for(;W<288;W++){V[W]=8}M=7;Y=new l(V,288,257,c,L,M);if(Y.status!=0){alert("HufBuild error: "+Y.status);return -1}Q=Y.root;M=Y.m;for(W=0;W<30;W++){V[W]=5}zip_fixed_bd=5;Y=new l(V,30,0,J,z,zip_fixed_bd);if(Y.status>1){Q=null;alert("HufBuild error: "+Y.status);return -1}b=Y.root;zip_fixed_bd=Y.m}m=Q;p=b;f=M;j=zip_fixed_bd;return g(aa,Z,X)}function A(af,X,ah){var ab;var aa;var Y;var W;var ag;var ad;var V;var Z;var ae=new Array(286+30);var ac;for(ab=0;ab<ae.length;ab++){ae[ab]=0}R(5);V=257+u(5);d(5);R(5);Z=1+u(5);d(5);R(4);ad=4+u(4);d(4);if(V>286||Z>30){return -1}for(aa=0;aa<ad;aa++){R(3);ae[q[aa]]=u(3);d(3)}for(;aa<19;aa++){ae[q[aa]]=0}f=7;ac=new l(ae,19,19,null,null,f);if(ac.status!=0){return -1}m=ac.root;f=ac.m;W=V+Z;ab=Y=0;while(ab<W){R(f);ag=m.list[u(f)];aa=ag.b;d(aa);aa=ag.n;if(aa<16){ae[ab++]=Y=aa}else{if(aa==16){R(2);aa=3+u(2);d(2);if(ab+aa>W){return -1}while(aa-->0){ae[ab++]=Y}}else{if(aa==17){R(3);aa=3+u(3);d(3);if(ab+aa>W){return -1}while(aa-->0){ae[ab++]=0}Y=0}else{R(7);aa=11+u(7);d(7);if(ab+aa>W){return -1}while(aa-->0){ae[ab++]=0}Y=0}}}}f=S;ac=new l(ae,V,257,c,L,f);if(f==0){ac.status=1}if(ac.status!=0){if(ac.status==1){}return -1}m=ac.root;f=ac.m;for(ab=0;ab<Z;ab++){ae[ab]=ae[ab+V]}j=h;ac=new l(ae,Z,0,J,z,j);p=ac.root;j=ac.m;if(j==0&&V>257){return -1}if(ac.status==1){}if(ac.status!=0){return -1}return g(af,X,ah)}function O(){var V;if(C==null){C=new Array(2*n)}k=0;s=0;r=0;U=-1;N=false;T=y=0;m=null}function F(Z,X,W){var Y,V;Y=0;while(Y<W){if(N&&U==-1){return Y}if(T>0){if(U!=w){while(T>0&&Y<W){T--;y&=n-1;k&=n-1;Z[X+Y++]=C[k++]=C[y++]}}else{while(T>0&&Y<W){T--;k&=n-1;R(8);Z[X+Y++]=C[k++]=u(8);d(8)}if(T==0){U=-1}}if(Y==W){return Y}}if(U==-1){if(N){break}R(1);if(u(1)!=0){N=true}d(1);R(2);U=u(2);d(2);m=null;T=0}switch(U){case 0:V=v(Z,X+Y,W-Y);break;case 1:if(m!=null){V=g(Z,X+Y,W-Y)}else{V=K(Z,X+Y,W-Y)}break;case 2:if(m!=null){V=g(Z,X+Y,W-Y)}else{V=A(Z,X+Y,W-Y)}break;default:V=-1;break}if(V==-1){if(N){return 0}return -1}Y+=V}return Y};decompress=function(Y){var W,Z;var X,V;O();B=Y;E=0;Z=new Array(1024);W="";while((X=F(Z,0,Z.length))>0){for(V=0;V<X;V++){W+=String.fromCharCode(Z[V])}}B=null;return W}

    //for (var i=0;i<1000;i++) {
      s = decompress(getNextBytesAsString(stream.length));
    //  if (s.indexOf("document")>-1)
        console.log(stream.length);
//    }
        currentByteIndex += 18;
        compressedSize = getNextBytesAsNumber(4);
        currentByteIndex += 4;
        fileNameLength = getNextBytesAsNumber(2);
        extraFieldLength = getNextBytesAsNumber(2);
        fileName = getNextBytesAsString(fileNameLength);
        currentByteIndex += extraFieldLength;
       if (fileName == 'word/document.xml')
          doc = decompress(getNextBytesAsString(compressedSize));
      else if (fileName == 'word/document.xml')
          style = decompress(getNextBytesAsString(compressedSize));
        else
          currentByteIndex += compressedSize;
      //}
      return ['','']
  //    return [doc, style];
    }

        var reader = new FileReader();

        reader.onload = function(e) {

    //      (function(a){var b=function(c){this.fileContents=new b.BigEndianBinaryStream(c)};a.JSUnzip=b;b.MAGIC_NUMBER=67324752;b.prototype={readEntries:function(){if(!this.isZipFile()){throw new Error("File is not a Zip file.")}this.entries=[];var c=new b.ZipEntry(this.fileContents);while(typeof(c.data)==="string"){this.entries.push(c);c=new b.ZipEntry(this.fileContents)}},isZipFile:function(){return this.fileContents.getByteRangeAsNumber(0,4)===b.MAGIC_NUMBER}};b.ZipEntry=function(c){this.signature=c.getNextBytesAsNumber(4);if(this.signature!==b.MAGIC_NUMBER){return}this.versionNeeded=c.getNextBytesAsNumber(2);this.bitFlag=c.getNextBytesAsNumber(2);this.compressionMethod=c.getNextBytesAsNumber(2);this.timeBlob=c.getNextBytesAsNumber(4);if(this.isEncrypted()){throw"File contains encrypted entry. Not supported."}if(this.isUsingUtf8()){throw"File is using UTF8. Not supported."}if(this.isUsingBit3TrailingDataDescriptor()){throw"File is using bit 3 trailing data descriptor. Not supported."}this.crc32=c.getNextBytesAsNumber(4);this.compressedSize=c.getNextBytesAsNumber(4);this.uncompressedSize=c.getNextBytesAsNumber(4);if(this.isUsingZip64()){throw"File is using Zip64 (4gb+ file size). Not supported"}this.fileNameLength=c.getNextBytesAsNumber(2);this.extraFieldLength=c.getNextBytesAsNumber(2);this.fileName=c.getNextBytesAsString(this.fileNameLength);this.extra=c.getNextBytesAsString(this.extraFieldLength);this.data=c.getNextBytesAsString(this.compressedSize)};b.ZipEntry.prototype={isEncrypted:function(){return(this.bitFlag&1)===1},isUsingUtf8:function(){return(this.bitFlag&2048)===2048},isUsingBit3TrailingDataDescriptor:function(){return(this.bitFlag&8)===8},isUsingZip64:function(){this.compressedSize===4294967295||this.uncompressedSize===4294967295}};b.BigEndianBinaryStream=function(c){this.stream=c;this.resetByteIndex()};b.BigEndianBinaryStream.prototype={resetByteIndex:function(){this.currentByteIndex=0},getByteAt:function(c){return this.stream.charCodeAt(c)},getNextBytesAsNumber:function(c){var d=this.getByteRangeAsNumber(this.currentByteIndex,c);this.currentByteIndex+=c;return d},getNextBytesAsString:function(c){var d=this.getByteRangeAsString(this.currentByteIndex,c);this.currentByteIndex+=c;return d},getByteRangeAsNumber:function(e,d){var c=0;var f=e+d-1;while(f>=e){c=(c<<8)+this.getByteAt(f);f--}return c},getByteRangeAsString:function(g,f){var d="";var c=g+f;var h=g;while(h<c){var e=this.getByteAt(h);d+=String.fromCharCode(e);c-=Math.floor(e/255);h++}return d}}}(this));


/*
          var unzipper = new JSUnzip(e.target.result);
      unzipper.isZipFile();      // true or false

      unzipper.readEntries();    // Creates "entries"
      alert(unzipper.entries);

*/
var rez = e.target.result;

          var docXML, styleXML;
          var new_zip = new JSZip();
          new_zip.loadAsync(rez)
          .then(function(zip) {
            return zip.file("word/document.xml").async("string")
          }).then(function (doc_raw) {
            docXML = doc_raw;

            new_zip.loadAsync(rez)
            .then(function(zip) {
              return zip.file("word/styles.xml").async("string")
            }).then(function (doc_raw) {
              styleXML = doc_raw;
              xml2html(docXML, styleXML)
            });



          });


          function xml2html(docXML, styleXML){


          //convert binary zip >> extract [document xml, styleclasses xml] >> binary to utf8 unzip
        //  var docAndStyleXML = docx2html(e.target.result), docXML = docAndStyleXML[0], styleXML = docAndStyleXML[1];

          //DOM containing available styles and their properties
          var styleDom = $(new DOMParser().parseFromString(styleXML.replace(/<w:/g, '<').replace(/<\/w:/g, '</'), 'text/xml'));

          //DOM containing document elements and some formatting
          var inputDom = new DOMParser().parseFromString(docXML.replace(/<[a-zA-Z]*?:/g, '<').replace(/<\/[a-zA-Z]*?:/g, '</'), 'text/xml').firstChild.getElementsByTagName('body')[0];

          var outputDOM = document.createElement('body');


          // P paragraph node list in the doc containing all paragraphs, each containing in-line <r> text ranges equivalent to <span> and style info as <pPr>
          for (i = 0; inNode = inputDom.childNodes[i]; i++) {

            var outNode = document.createElement('p');

            //text range fromatting is computed to simple debate html and added to temp string
            for (j = 0; inNodeChild = inNode.getElementsByTagName('r')[j]; j++) {

              var val = $(inNodeChild).text();

              //encoding errors
            //  var inFixChar = [145,146,147,148,150,151,226], outFixChar = ["-","-",'-','-','-','--',"'"];
            //  for (var z =0; z < inFixChar.length; z++)
            //    val=val.replace((new RegExp(String.fromCharCode(inFixChar[z]), 'gi') ), ' ');

              var styleAttrNode = inNodeChild.getElementsByTagName("rStyle")[0];
              if (styleAttrNode) {
                var styleCustom = styleDom.find("*[w\\:styleId='" + styleAttrNode.getAttribute('w:val') + "']")[0];
                if (styleCustom)
                  inNodeChild.appendChild(styleCustom.cloneNode(true));
              }

              if (inNodeChild.getElementsByTagName('b').length)
                val = '<b>' + val + '</b>';

              if (inNodeChild.getElementsByTagName('u').length)
                val = '<u>' + val + '</u>';
              //if (inNodeChild.getElementsByTagName('sz').length)
              //  val = '<span style="font-size:' + (inNodeChild.getElementsByTagName('sz')[0].getAttribute('w:val') / 2) + 'pt">' + val + '</span>';
              if (inNodeChild.getElementsByTagName('highlight').length)
                val = '<span style="background-color:' + inNodeChild.getElementsByTagName('highlight')[0].getAttribute('w:val') + '">' + val + '</span>';

              outNode.innerHTML += val;
            }

            //paragraph-level formatting, looking up the right style class in the <pPr> for it is different than text ranges
            var styleAttrNode = inNode.getElementsByTagName('pPr').length ? inNode.getElementsByTagName('pPr')[0].getElementsByTagName("pStyle")[0] :  false;
            if (styleAttrNode) {
              var styleCustom = styleDom.find("*[w\\:styleId='" + styleAttrNode.getAttribute('w:val') + "']")[0];
              if (styleCustom){
                if (styleCustom.getElementsByTagName('b').length)
                  outNode.innerHTML = '<b>' + outNode.innerHTML + '</b>';
                if (styleCustom.getElementsByTagName('u').length)
                  outNode.innerHTML = '<u>' + outNode.innerHTML + '</u>';
                if (styleCustom.getElementsByTagName('outlineLvl').length){
                  var headingLevel = styleCustom.getElementsByTagName('outlineLvl')[0].getAttribute('w:val');
                  outNode.innerHTML = '<h'+ (parseInt(headingLevel)+1) + '>' + outNode.innerHTML + '</h'+(parseInt(headingLevel)+1)+'>';

                }
              }
            }

            //full paragraph to output
            outputDOM.appendChild(outNode);
          }


          setTimeout(function(){
            $(".doc:visible").html(outputDOM.innerHTML);
          }, 300);
            /**/

        }


        }


      //  for (f = 0; f<files.length; f++)
          reader.readAsBinaryString(files[0]);
  })

});



});


//gapi drive load
var apiKey = 'AIzaSyDgdM5CpdzE3dLHD877L8fB3PyxVpV7pY4';
var authToken;

function gapiInit() {
  gapi.client.setApiKey(apiKey);
  gapi.auth.authorize({
    client_id: '675454780693-7n34ikba11h972dgfc0kgib0id9gudo8.apps.googleusercontent.com',
    scope: ['profile', 'email', 'https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive.install'],
    immediate: true
  }, function(res) {
    authToken = res.access_token;
    gapi.client.load('drive', 'v2', function() {});
    gapi.load('picker', {
      'callback': function() {}
    });
  });
}




  //recognize speech

  $(window).keydown(function(e) {


    if (e.keyCode == 192) {



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




    }

  })




window.docShareAlert = function(msg) {

  $("#info").append('<div class="alert alert-success alert-dismissable">' +
      '<button  class="close" data-dismiss="alert">&times;</button>' +
      msg.owner + ' has shared \"' + msg.title + '\" with you. <button data-dismiss="alert" class="btn btn-xs btn-primary">Accept</button></div>')
      .on('close.bs.alert', '.alert', function () {
          $.get('/user/notify', {fileId:msg.fileId})

      })
      .on('click', ".btn-primary", function() {
        ft.click(msg.fileId )
        window.location.pathname="/"+msg.fileId;
      })


}





    /*
    function initUserOffline(e) { //****no internet -- offline mode

        //load cache
        //TODO move from index

      var resources = ["lib/bootstrap.min.css", "lib/select2.min.css",
          "lib/jquery.min.js", "lib/bootstrap.min.js", "lib/select2.full.min.js"];

      if (location.protocol!="file:")
      for (var i =0; i< resources.length; i++)
        $('<script>').appendTo('body').attr('src', resources[i]);


        $('body').append('<div id="offline" style="position: absolute; bottom: 0px; left: 0px; z-index: 9999;">Offline</div>');

        u = {name:"offline", index:[]};
        window.local = true;

        if (!localStorage.debate || localStorage.debate=='undefined') {
          localStorage.debate_local0 = '{"userid":"local","title":"First","text":"First file","id":"local0"}';
          localStorage.debate = '[{"id":"local0","title":"First","type":"file","children":[]}]';
        }

        u.index = JSON.parse(localStorage.debate);

        //init filetree
        ft.init($('#filetree'), u.index);

    }*/
