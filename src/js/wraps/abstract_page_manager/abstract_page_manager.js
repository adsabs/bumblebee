define([
  'js/page_managers/toc_controller',
  'js/page_managers/three_column_view',
  'hbs!js/wraps/abstract_page_manager/abstract-page-layout',
  'hbs!js/wraps/abstract_page_manager/abstract-nav',
  'utils',
  'analytics',
], function(
  PageManagerController,
  PageManagerView,
  PageManagerTemplate,
  TOCTemplate,
  utils
) {
  var PageManager = PageManagerController.extend({
    persistentWidgets: [
      'SearchWidget',
      'ShowAbstract',
      'ShowCitations',
      'ShowToc',
      'ShowReferences',
      'tocWidget',
    ],

    TOCTemplate: TOCTemplate,

    initialize: function() {
      PageManagerController.prototype.initialize.apply(this, arguments);
      this.abstractTimer = new utils.TimingEvent('abstract-loaded', 'workflow');
    },

    createView: function(options) {
      options = options || {};
      options.template = options.template || PageManagerTemplate;
      return new PageManagerView({ template: PageManagerTemplate });
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      this.debug = beehive.getDebug(); // XXX:rca - think of st better
      this.view = this.createView({ debug: this.debug, widgets: this.widgets });
      var pubsub = this.getPubSub();
      this.onDetailsPage = false;
      pubsub.subscribe(
        pubsub.DISPLAY_DOCUMENTS,
        _.bind(this.onDisplayDocuments, this)
      );
      pubsub.subscribe(pubsub.NAVIGATE, (name, data) => {
        this.onDetailsPage =
          data && data.href && data.href.indexOf('abs/') > -1;
      });
    },

    assemble: function(app) {
      var self = this;

      return PageManagerController.prototype.assemble
        .apply(this, arguments)
        .done(function() {
          self.addQuery(self.getCurrentQuery());

          try {
            _.forEach(_.keys(self.widgets), (k) => {
              const w = self.widgets[k];
              const handler = _.debounce(() => {
                if (
                  k === 'ShowAbstract' &&
                  $(self.widgetDoms[k]).text() !== ''
                ) {
                  self.abstractTimer.stop();
                }
              }, 300);

              if (w.widgets && w.widgets.length > 0) {
                _.forEach(w.widgets, (sub) => (sub.onIdle = handler));
              }
              w.onIdle = handler;
            });
          } catch (e) {
            // do nothing
          }
        });
    },

    addQuery: function(apiQuery) {
      if (this.view.model) this.view.model.set('query', apiQuery.url());
    },

    show: function(pageName) {
      var ret = PageManagerController.prototype.show.apply(this, arguments);
      var href = this.getCurrentQuery().url();

      if (!_.isEmpty(href)) {
        ret.$el
          .find('.s-back-button-container')
          .empty()
          .html(
            '<a href="#search/' +
              href +
              '" class="back-button btn btn-sm btn-default"> <i class="fa fa-arrow-left" aria-hidden="true"></i> Back to results</a>'
          );
      }

      // when arriving at the abstract page, scroll back to the top
      if (
        pageName === 'ShowAbstract' &&
        typeof window.scrollTo === 'function'
      ) {
        window.scrollTo(0, 0);
      }
      return ret;
    },

    onDisplayDocuments: function(apiQuery) {
      const bibcode = this.parseIdentifierFromQuery(apiQuery);

      if (bibcode === 'null') {
        return;
      }
      this.widgets.tocWidget.model.set('bibcode', bibcode);

      // do not allow the timer to start again if we haven't left the abstract page
      if (!this.onDetailsPage) {
        this.abstractTimer.start();
      }
    },

    navConfig: {
      ShowAbstract: {
        title: 'Abstract',
        path: 'abstract',
        showCount: false,
        isSelected: true,
        category: 'view',
        alwaysThere: 'true',
        order: 0,
      },
      ShowCitations: {
        title: 'Citations',
        path: 'citations',
        category: 'view',
        order: 1,
      },
      ShowReferences: {
        title: 'References',
        path: 'references',
        category: 'view',
        order: 2,
      },
      ShowCoreads: {
        title: 'Co-Reads',
        path: 'coreads',
        category: 'view',
        showCount: false,
        order: 3,
      },
      ShowSimilar: {
        title: 'Similar Papers',
        path: 'similar',
        category: 'view',
        showCount: false,
        order: 4,
      },
      ShowToc: {
        title: 'Volume Content',
        path: 'toc',
        category: 'view',
        showCount: false,
        order: 5,
      },
      ShowGraphics: {
        title: 'Graphics',
        path: 'graphics',
        showCount: false,
        category: 'view',
        order: 6,
      },
      ShowMetrics: {
        title: 'Metrics',
        path: 'metrics',
        showCount: false,
        category: 'view',
        order: 7,
      },
      ShowExportcitation__default: {
        title: 'Export',
        path: 'exportcitation',
        category: 'export',
        alwaysThere: 'true',
        order: 8,
      },
    },
  });
  return PageManager;
});
