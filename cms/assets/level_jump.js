/* global $:false */

'use strict';
$(function(){
  var paginator = {};
  var GobMx = {};

  if( !_.isUndefined(window.GobMx))
    GobMx = window.GobMx;

  if( _.isFunction( GobMx.Paginator) )
    paginator = new GobMx.Paginator;

  // animate jump to section given by selector
  // push target into window history
  // return true on success
  var pushSectionJump = function( location ){
    var result = false;
    var target = $(location);
    if (target.size() > 0){
      _.delay(function(){
        window.location.href = location
      }, 100);
      result = true;
    }
    return result;
  }

  // jump to given element. If it is not loaded yet
  // fetch it using given paginator
  var doJump = function( idOrUrl, paginator ){
    // if target is within current page
    if ( idOrUrl.substring(0,1) == "#" ){
      if(!pushSectionJump( idOrUrl )){
        //else fetch current offset to given level, then jump
        if( GobMx.xhrLocked !== true ){
          GobMx.xhrLocked = true
          paginator.fetch({
            upToId: idOrUrl.substring(1, idOrUrl.size),
            success: _.bind(function(){
              GobMx.xhrLocked = false;
              pushSectionJump(idOrUrl);
            }, this )
          });
        }
      }
    }else{
      // target is url: navigate
      window.location.href = idOrUrl
    }
  }

  // jump to element if we have a hash fragment
  var destination = window.location.href.split('#')[1];
  if(_.isString(destination))
      doJump('#'+destination, paginator);

  $('.landing-btn a').click(function(event){
    event.preventDefault();
    var target = this.getAttribute('href');
    doJump( target, paginator );
  })



});
