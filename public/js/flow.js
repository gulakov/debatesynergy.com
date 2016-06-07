

$(document).ready(function(){

    // FLOWING ****


    //  $(".speech ").attr('contenteditable', 'false')


    // allow only "flowing input" for enemy's speeches
    $("#round").on("mousedown click", ".flow-mode", function(e) {


    /*  if (r.aff1 == u.email || r.aff2 == u.email)
        r.mySide = "aff";
      else if (r.neg1 == u.email || r.neg2 == u.email)
        r.mySide = "neg";

      var isSpeechAff = $(this).index()%2;

      //if you're in your own speech or no side declared -- exit inserting flow
      if ( (!r.mySide) || (r.mySide == "aff" && isSpeechAff) || (r.mySide == "neg" && !isSpeechAff) )
        return;

        */





      console.log(e);


      var p = $(e.target).closest('p, .flow, .speech > *');

      if (p.prev().prev().hasClass("flow")){

        p.prev().prev().find('textarea').focus();

      }
      if (p.prev().hasClass("flow")){

        p.prev().find('textarea').focus();

      }
      else if (p.hasClass("flow")){

        p.find('textarea').focus();

      } else{

        var flow = $("<div class='flow'><textarea class='flow-text'></textarea> <div class='fa fa-2x fa-chevron-circle-down flow-toggle'></div> "+
          "  <div class='flow-link fa fa-2x fa-link'  data-placement='left' title='Click Flow Anchor, then select a response in another speech to scroll to, when you hover over this flow entry'></div></div>");

        flow.insertBefore(p)

        flow.find('textarea').focus();



        $('[title]').tooltip();
      }





        /*

      var range = document.createRange();
      range.setStart(el[0], 0);
      range.setEnd(el[0], 1);
      sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);*/


    })



    //allow user to create link to align scroll with paragraph in side-by-side speech
    $("#round").on("click", ".flow-link", function(){
      var _this = $(this);

      _this.toggleClass("active-link");


      if (_this.hasClass("active-link")){

          $(".active-speech").addClass('flow-link-selecting-mode');

          $(".active-speech > *").on("mousedown",  function() {

              $(".active-speech > *").off("mousedown");
              $(".active-speech").removeClass('flow-link-selecting-mode');


              var randomFlowId = Math.floor(Math.random()*1000);

              _this.data("flow-anchor",randomFlowId)

              $(this).addClass("flow-anchor-"+randomFlowId)


              //cant be same speech





          })



      }


    })

    $("#round").on("scroll", ".speech", function(){
      //$(this).scrollLeft(0);
    });


    //mouseover the flow entry to scroll lock-onto the linked response
    $("#round").on("mouseover mousemove", ".flow", function(){
      var _this = $(this).find(".flow-link");
      if (!_this.hasClass("active-link"))
        return;

      var anchor = $(".flow-anchor-" + _this.data("flow-anchor") );

      anchor.css('background-color', 'lightblue');
      setTimeout(function(){
        anchor.css('background-color', '');
      }, 1000)

      var target_speech = anchor.closest(".speech");

      //align the target's speech scroll to match
      target_speech.scrollTop(   target_speech.scrollTop()  - _this.offset().top   +  anchor.offset().top  )


    })



    $("#round").on("click", ".flow-toggle", function(){
      var _this = $(this);



      if (_this.hasClass("flow-collapsed")){ // show
        _this.removeClass("flow-collapsed fa-chevron-circle-right").addClass("fa-chevron-circle-down")
        _this = _this.parent();

          while (_this.next().length && !_this.next().hasClass("flow")){
              _this = _this.next();
              _this.show()
          }

      } else { //hide
        _this.addClass("flow-collapsed  fa-chevron-circle-right").removeClass("fa-chevron-circle-down")

        _this = _this.parent();

        while (_this.next().length && !_this.next().hasClass("flow")){

            _this = _this.next();
            _this.hide()
        }

      }
    })


  $('#round').on( 'change keyup cut paste', '.flow-text', function (){
      $(this).height("30px").height(this.scrollHeight);

      var text = $(this).val();

      //text = text.replace(/v /gi, 'VOTER')

      //$(this).text(text)


      console.log(text);

      if (!text.length)
        $(this).parent().remove()

  })

  $('#round').on( 'blur', '.flow-text', function (){

    var text = $(this).val();

    if (!text.length)
      $(this).parent().remove()

    })

})//dom ready
