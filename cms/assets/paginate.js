/* global $:false */

'use strict';

//# sourceURL=paginate.js
if (! _.isFunction($.paginate)) {
  var GobMx = window.GobMx;

  var Fetcher = function(paginated, paginator, config){
    this.paginated = paginated;
    this.paginator = paginator;
    this.config = config;
  }
  _.extend(Fetcher.prototype, {
    fetchOnScroll: _.throttle(function(){
      if( GobMx.xhrLocked !== true ){
        var currentOffset = this.paginator.offset(); //$('.paginated').find('section').size();
        if( ( (Math.abs(
          $(this.paginated).height() - $(window).height()
        ) -100 < $(window).scrollTop()) || ($(this.paginated).height() < 600))
            && currentOffset < this.config.totalLevels )
        {
          GobMx.xhrLocked = true;
          this.paginator.fetch( {
            from: currentOffset,
            tab: $('input[id="tab_title"]').val(),
            success: _.bind(function(){
              
              GobMx.xhrLocked = false;
              // fetch again in case an empty page was retrieved this time
              this.fetchOnScroll();
            }, this)
          })
        }
      }}, 500)
  });

  jQuery.fn.extend({
    paginate: function (options) {
      var paginated = this;
      var locked = false;
      // default config
      options = options || {};
      try{
        options.totalLevels = Number(options.totalLevels);
      }catch(e){
        console.error("wrong totalLevels:"+options.totalLevels);
        options.totalLevels = -1;
      }
      try{

        options.size = Number( options.size );
      }catch(e){
        console.error("bad (page)size:"+options.size);
        options.size = 12;
      }
      var config = _.extend({
        totalLevels: -1,
        offset: 0,
        size: 3,
        throttleWait: 500,
        url: "/?offset="
      }, options );
      var spinner = '<div id="paginate-spinner" class="text-center"><i \
      class="fa fa-spinner fa-spin" style="font-size:4em"></i></div>';

      var paginator = new GobMx.Paginator({
        size: config.size
      });
      var fetcher = new Fetcher(paginated, paginator, config);
      // bind scroll
      $(window).scroll(
        _.bind(fetcher.fetchOnScroll,fetcher)
      );
      return fetcher;
    }
  })
}
;
