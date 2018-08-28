define([
  'underscore',
  'js/widgets/facet/factory'
], function (
  _,
  FacetFactory
) {
  return function (options) {
    var widget = FacetFactory.makeHierarchicalCheckboxFacet(_.extend({
      facetField: 'author_facet_hier',
      facetTitle: 'Authors',
      openByDefault: true,
      logicOptions: { single: ['limit to', 'exclude'], multiple: ['and', 'or', 'exclude'] }
    }, options));

    return widget;
  };
});
