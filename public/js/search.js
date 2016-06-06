$(document).ready(function(){


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
        getSelection().anchorNode.parentNode.scrollIntoView()
    }

    //loadFile(e.params.data.id, findTerm)
    setTimeout(findTerm, 1500)


  });




}) //end doc ready
