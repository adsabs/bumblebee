define([
  'js/page_managers/controller',
  'js/page_managers/three_column_view',
  'hbs!js/page_managers/templates/results-page-layout'
], function (
  PageManagerController,
  PageManagerView,
  PageManagerTemplate) {
  var PageManager = PageManagerController.extend({

    persistentWidgets: [
      'PubtypeFacet', 'SearchWidget', 'BreadcrumbsWidget', 'Sort',
      'ExportDropdown', 'VisualizationDropdown', 'AffiliationFacet', 'AuthorFacet',
      'DatabaseFacet', 'RefereedFacet', 'KeywordFacet', 'BibstemFacet',
      'BibgroupFacet', 'DataFacet', 'VizierFacet', 'GrantsFacet', 'Results',
      'OrcidBigWidget', 'QueryInfo', 'GraphTabs', 'OrcidSelector'
    ],

    createView: function (options) {
      options = options || {};
      options.template = options.template || PageManagerTemplate;
      return new PageManagerView({
        template: PageManagerTemplate
      });
    },

    show: function () {
      var ret = PageManagerController.prototype.show.apply(this, arguments);
      var button = '<a href="#" class="back-button btn btn-sm btn-default"> <i class="fa fa-arrow-left"></i> Start New Search</a>';
      ret.$el.find('.s-back-button-container').empty().html(button);
      return ret;
    }

  });
  return PageManager;
});
