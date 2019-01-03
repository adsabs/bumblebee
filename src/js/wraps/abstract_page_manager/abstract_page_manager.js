define([
  'js/page_managers/toc_controller',
  'js/page_managers/three_column_view',
  'hbs!js/wraps/abstract_page_manager/abstract-page-layout',
  'hbs!js/wraps/abstract_page_manager/abstract-nav'
], function (
  PageManagerController,
  PageManagerView,
  PageManagerTemplate,
  TOCTemplate
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
        var storage = app.getObject('AppStorage');
        if (storage && storage.hasCurrentQuery()) self.addQuery(storage.getCurrentQuery());
      })
    },

    addQuery: function (apiQuery) {
      if (this.view.model) this.view.model.set('query', apiQuery.url());
    },

    show: function (pageName) {
      var ret = PageManagerController.prototype.show.apply(this, arguments);
      if (this.view.model && this.view.model.has('query')) {
        ret.$el.find('.s-back-button-container').empty().html('<a href="#search/' + this.view.model.get('query') + '" class="back-button btn btn-sm btn-default"> <i class="fa fa-arrow-left"></i> Back to results</a>');
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

    navConfig: {
      ShowAbstract: {
        title: 'Abstract', path: 'abstract', showCount: false, isSelected: true, category: 'view', alwaysThere: 'true'
      },
      ShowCitations: { title: 'Citations', path: 'citations', category: 'view' },
      ShowReferences: { title: 'References', path: 'references', category: 'view' },
      ShowCoreads: {
        title: 'Co-Reads', path: 'coreads', category: 'view', showCount: false
      },
      ShowTableofcontents: {
        title: 'Volume Content', path: 'tableofcontents', category: 'view', showCount: false
      },
      ShowSimilar: { title: 'Similar Papers', path: 'similar', category: 'view' },
      ShowGraphics: {
        title: 'Graphics', path: 'graphics', showCount: false, category: 'view'
      },
      ShowMetrics: {
        title: 'Metrics', path: 'metrics', showCount: false, category: 'view'
      },
      ShowPaperExport__default: {
        title: 'Export', path: 'export', category: 'export', alwaysThere: 'true'
      }
    }


  });
  return PageManager;
});
