define([], function () {
  return {
    // add secondary sort with correct asc/desc
    addSecondarySort: function (apiQuery) {

      // ensure we always apply a default sort
      if (!apiQuery.has('sort')) {
        apiQuery.set('sort', 'date desc');
      }

      // only get before the first column to prevent adding redundant secondary sort
      var primarySort = apiQuery.get('sort')[0].split(',')[0];
      var secondarySort = primarySort.indexOf(' asc') > -1 ? 'bibcode asc' : 'bibcode desc';
      apiQuery.set('sort', primarySort + ', ' + secondarySort);
    }
  };
});
