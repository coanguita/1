$(function(){
  var totalLevels = $('#total-levels').val();
  var pageSize = $('#page-size').val();
  var fetcher = $('.paginated').paginate({
    totalLevels: totalLevels,
    size: pageSize
  });
  if(window.location.href.indexOf('#') == -1 )
    fetcher.fetchOnScroll();
});
