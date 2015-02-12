define(['js/widgets/facet/factory' ], function ( FacetFactory) {

  return function() {
    var widget = FacetFactory.makeBasicCheckboxFacet({
      facetField: "bibstem_facet",
      facetTitle: "Publications",
      openByDefault: true,
      logicOptions: {single: ['limit to', 'exclude'], multiple: ["or", "exclude"]}
    });
    return widget;
  };

});