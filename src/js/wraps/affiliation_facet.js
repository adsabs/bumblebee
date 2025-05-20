define(['lodash/dist/lodash.compat', 'js/widgets/facet/factory'], function(_, FacetFactory) {
  return function(options) {
    var widget = FacetFactory.makeHierarchicalCheckboxFacet(
      _.extend(
        {
          facetField: 'aff_facet_hier',
          facetTitle: 'Institutions',
          openByDefault: false,
          logicOptions: {
            single: ['limit to', 'exclude'],
            multiple: ['and', 'or', 'exclude'],
          },
        },
        options
      )
    );

    return widget;
  };
});
