/**
 * Main JS file for Casper behaviours
 */

/*globals jQuery, document */
(function ($) {
    "use strict";

    $(document).ready(function(){
        $(".post-content").fitVids();
        // Tapirus
        var options = {
          dateFormat: 'MMMM D, YYYY',
          queryFilter: function(query) {
              return query
          },
          inputSelector: 'input[type="search"]',
          sessionStorage: false,
          sortBy: undefined,
          templates: {
              count: '<h3 class="search-results-count">{{count}} results for <q>{{query}}</q></h3>',
              result: '<div class="search-result"><h2 class="post-title"><a href="{{link}}">{{title}}</a></h2><time class="post-date" datetime="{{published_on}}">{{date}}</time><p class="post-preview">{{snippet}}</p></div>',
          }
        }
        $("#results").Tapirus('536b7ad4704e5d0200000003', options);

        function casperFullImg() {
            $("img").each( function() {
                var contentWidth = $(".post-content").outerWidth(); // Width of the content
                var imageWidth = $(this)[0].naturalWidth; // Original image resolution

                if (imageWidth >= contentWidth) {
                    $(this).addClass('full-img');
                } else {
                    $(this).removeClass('full-img');
                }
            });
        };

        casperFullImg();
        $(window).smartresize(casperFullImg);

    });

}(jQuery));

(function($,sr){

  // debouncing function from John Hann
  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
  var debounce = function (func, threshold, execAsap) {
      var timeout;

      return function debounced () {
          var obj = this, args = arguments;
          function delayed () {
              if (!execAsap)
                  func.apply(obj, args);
              timeout = null;
          };

          if (timeout)
              clearTimeout(timeout);
          else if (execAsap)
              func.apply(obj, args);

          timeout = setTimeout(delayed, threshold || 100);
      };
  }
  // smartresize
  jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

})(jQuery,'smartresize');
