define([
  'js/page_managers/toc_controller',
  'js/page_managers/three_column_view',
  'hbs!js/wraps/abstract_page_manager/abstract-page-layout',
  'hbs!js/wraps/abstract_page_manager/abstract-nav',
  'analytics'
], function (
  PageManagerController,
  PageManagerView,
  PageManagerTemplate,
  TOCTemplate,
  analytics
) {
  var PageManager = PageManagerController.extend({

    persistentWidgets: ['SearchWidget', 'ShowAbstract', 'ShowCitations', 'ShowTableofcontents', 'ShowReferences', 'tocWidget'],

    TOCTemplate: TOCTemplate,

    createView: function (options) {
      options = options || {};
      options.template = options.template || PageManagerTemplate;
      return new PageManagerView({ template: PageManagerTemplate });
    },

    activate: function (beehive) {
      this.setBeeHive(beehive);
      this.debug = beehive.getDebug(); // XXX:rca - think of st better
      this.view = this.createView({ debug: this.debug, widgets: this.widgets });
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, _.bind(this.onDisplayDocuments, this));
    },

    assemble: function (app) {
      var self = this;
      return PageManagerController.prototype.assemble.apply(this, arguments).done(function() {
        self.addQuery(self.getCurrentQuery());
      });
    },

    addQuery: function (apiQuery) {
      if (this.view.model) this.view.model.set('query', apiQuery.url());
    },

    show: function (pageName) {
      var ret = PageManagerController.prototype.show.apply(this, arguments);
      var href = this.getCurrentQuery().url();

      if (!_.isEmpty(href)) {
        ret.$el.find('.s-back-button-container').empty()
          .html('<a href="#search/' + href + '" class="back-button btn btn-sm btn-default"> <i class="fa fa-arrow-left"></i> Back to results</a>');
      }

      // when arriving at the abstract page, scroll back to the top
      if (pageName === 'ShowAbstract' && typeof window.scrollTo === 'function') {
        window.scrollTo(0, 0);
      }
      return ret;
    },

    onDisplayDocuments: function (apiQuery) {
      var bibcode = apiQuery.get('q');
      if (bibcode.length > 0 && bibcode[0].indexOf('bibcode:') > -1 && this.widgets.tocWidget) {
        bibcode = bibcode[0].replace('bibcode:', '');
        this.widgets.tocWidget.model.set('bibcode', bibcode);
      }
    },

    onWidgetSelected: function (widget, event, data) {
      var bibcode = widget.model.get('bibcode');
      var target = data.idAttribute.toLowerCase().replace('show', '');
      analytics('send', 'event', 'interaction', 'toc-link-followed', {
        target: target,
        bibcode: bibcode
      });

      PageManagerController.prototype.onWidgetSelected.apply(this, arguments);
    },

    navConfig: {
      ShowAbstract: {
        title: 'Abstract',
        path: 'abstract',
        showCount: false,
        isSelected: true,
        category: 'view',
        alwaysThere: 'true',
        order: 0
      },
      ShowCitations: {
        title: 'Citations',
        path: 'citations',
        category: 'view',
        order: 1
      },
      ShowReferences: {
        title: 'References',
        path: 'references',
        category: 'view',
        order: 2
      },
      ShowCoreads: {
        title: 'Co-Reads',
        path: 'coreads',
        category: 'view',
        showCount: false,
        order: 3
      },
      ShowSimilar: {
        title: 'Similar Papers',
        path: 'similar',
        category: 'view',
        showCount: false,
        order: 4
      },
      ShowTableofcontents: {
        title: 'Volume Content',
        path: 'tableofcontents',
        category: 'view',
        showCount: false,
        order: 5
      },
      ShowGraphics: {
        title: 'Graphics',
        path: 'graphics',
        showCount: false,
        category: 'view',
        order: 6
      },
      ShowMetrics: {
        title: 'Metrics',
        path: 'metrics',
        showCount: false,
        category: 'view',
        order: 7
      },
      ShowPaperExport__default: {
        title: 'Export',
        path: 'export',
        category: 'export',
        alwaysThere: 'true',
        order: 8
      }
    }

  });
  return PageManager;
});
