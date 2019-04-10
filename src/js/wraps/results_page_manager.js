define([
  'js/page_managers/controller',
  'js/page_managers/three_column_view',
  'hbs!js/page_managers/templates/results-page-layout',
  'js/mixins/side_bar_manager'
], function (
  PageManagerController,
  PageManagerView,
  PageManagerTemplate,
  SideBarManagerMixin
) {
  var PageManager = PageManagerController.extend({

    initialize: function () {
      PageManagerController.prototype.initialize.apply(this, arguments);
      this._referrer = null;
    },

    persistentWidgets: [
      'PubtypeFacet', 'SearchWidget', 'BreadcrumbsWidget', 'Sort',
      'ExportDropdown', 'VisualizationDropdown', 'AffiliationFacet', 'AuthorFacet',
      'DatabaseFacet', 'RefereedFacet', 'KeywordFacet', 'BibstemFacet',
      'BibgroupFacet', 'DataFacet', 'VizierFacet', 'GrantsFacet', 'Results',
      'OrcidBigWidget', 'QueryInfo', 'GraphTabs', 'OrcidSelector'
    ],

    activate: function () {
      PageManagerController.prototype.activate.apply(this, arguments);

      // calls the sideBarManager mixin init handler
      this.init();
    },

    createView: function (options) {
      options = options || {};
      options.template = options.template || PageManagerTemplate;
      return new PageManagerView({
        template: PageManagerTemplate
      });
    },

    show: function () {
      var ret = PageManagerController.prototype.show.apply(this, arguments);
      var self = this;
      var button = '<a href="javascript:void(0);" class="back-button btn btn-sm btn-default"> <i class="fa fa-arrow-left"></i> Start New Search</a>';
      var $btn = ret.$el.find('.s-back-button-container');
      $btn.empty().off('click').html(button);
      $btn.click(function () {
        var ps = self.getPubSub();
        ps.publish(ps.NAVIGATE, self._referrer || 'index-page');
        self._referrer = null;
        return false;
      });
      return ret;
    },

    provideContext: function (ctx) {
      if (ctx.referrer) {
        this._referrer = ctx.referrer;
      }
    },

    assemble: function () {
      var self = this;
      return PageManagerController.prototype.assemble.apply(this, arguments).done(function () {
        _.each(_.keys(self.widgets), function (w) {
          self.listenTo(self.widgets[w], 'page-manager-event', _.bind(self.onPageManagerEvent, self, self.widgets[w]));
        }, self);

        self.setSidebarState(self._getUpdateFromUserData());
      });
    },

    broadcastTo: _.curry(function (widgets, event) {
      var args = arguments;
      var wids = _.pick(this.widgets, widgets);
      _.each(wids, function (w) {
        w.trigger.apply(w, [
          'page-manager-message', event
        ].concat(_.toArray(args).slice(2)));
      });
    }, 2),

    onPageManagerEvent: function (widget, event, data) {

      // this event is emitted from results widget
      if (event === 'side-bars-update') {
        this.setSidebarState(data);
      }
    }
  });

  _.extend(PageManager.prototype, SideBarManagerMixin);
  return PageManager;
});
