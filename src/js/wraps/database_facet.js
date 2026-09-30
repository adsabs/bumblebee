define(['js/widgets/facet/factory'], function(FacetFactory) {
  var ALLOWED_COLLECTIONS = ['astronomy', 'physics', 'general'];

  return function() {
    var widget = FacetFactory.makeBasicCheckboxFacet({
      facetField: 'database',
      facetTitle: 'Collections',
      openByDefault: true,

      preprocessors: function(facetList) {
        return facetList.filter(function(f) {
          return _.indexOf(ALLOWED_COLLECTIONS, f.value) !== -1;
        });
      },

      logicOptions: {
        single: ['limit to', 'exclude'],
        multiple: ['and', 'or', 'exclude'],
      },
    });
    return widget;
  };
});
