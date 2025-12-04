// GobMx global object definition
// hold all other functionality
( function( factory ){
  var root = self;

// browser global to hold GobMx reference
  root.GobMx = factory( root, {})
})( function(root, GobMx){
  GobMx.VERSION = '0.1';
  GobMx.xhrLocked = false;
  return GobMx;
});

// GobMx.Paginator definition
( function(factory){
  var root = self;
  var GobMx = root.GobMx;

  // browser global to hold GobMx reference
  GobMx.Paginator = factory(root, {}, root._, root.$)
})( function( root, Paginator, _, $){
  Paginator = function( options ){
    var options = options || {};
    this.options = _.extend({
      url: $('#route').val() + "/api/v1/levels",
      paginatedSelector: ".paginated",
      size: 3
    }, options);
  }

  _.extend( Paginator.prototype, {
    // html to show a spinner while loading next page
    spinner: '<div id="paginate-spinner" class="text-center"><i \
      class="fa fa-spinner fa-spin" style="font-size:4em"></i></div>',
    // fetch a page
    fetch: function( options ){
      options = _.pick(options, 'from', 'size', 'upToId', 'success', 'tab');

      var config = this.options;
      // ajax call get data from server and append to the div
      var paginated = $(config.paginatedSelector)
      paginated.append(this.spinner);

      $.ajax({
        url: config.url,
        data: {
          offset: options.from || this.offset(),
          size: options.size || config.size,
          up_to: options.upToId,
          tab: options.tab || ""
        },
        success: function( response ){
          $('#paginate-spinner').remove();
          paginated.append(response);
          //Reemplazar imagenes rotas, la funcion reemplazar viene de los 
          //assets imageReplace
          var imagenes = [];
          imagenes = document.getElementsByTagName('img');
          for (i = 0; i < imagenes.length; i++) {
              reemplazar(imagenes[i]);
          }
          if( _.isFunction(options.success) )
            options.success.apply(this);
        }
      })
    },
    // compute offset
    offset: function(){
      var paginated = $(this.options.paginatedSelector);

      return paginated.find('section').size();
    }
  });

  return Paginator;
});
