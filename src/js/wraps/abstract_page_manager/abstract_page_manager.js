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

      // observe scrolling and apply sticky menu
      this.observer = new IntersectionObserver(
        () => {
          this.adjustStickyElements();
        },
        { threshold: 0 }
      );
      this.observing = false;

      // observe resizing and apply sticky menu
      _.bindAll(this, 'adjustStickyElements');
      $(window).on('resize', _.throttle(this.adjustStickyElements, 200));
    },

    // Make menu bar and menus sticky
    adjustStickyElements: function() {
      // if single column and nav buttons container reached top of viewport, float nav button container and menu
      if (
        window.matchMedia('(max-width: 788px)').matches &&
        $('.s-search-bar-widget').get(0) &&
        $('.s-search-bar-widget')
          .get(0)
          .getBoundingClientRect().bottom <= 0
      ) {
        var height = $('#nav-button-container').outerHeight(true);
        this.stickElements(height);
        // without this abstract content will disappear with above elements fixed
        $('.s-abstract-content').attr('style', 'overflow: unset');
      } else {
        this.unStickElements();
        $('.s-abstract-content').attr('style', 'overflow: hidden');
      }
    },

    stickElements: function(top) {
      // button container
      $('#nav-button-container').addClass('sticky');
      // menu
      $('.s-nav-container').attr('style', `position:fixed;top:${top}px;left:0`);
      // full text sources widget
      $('#resources-container').attr(
        'style',
        `position:fixed;top:${top}px;left:100%`
      );
    },

    unStickElements: function() {
      $('#nav-button-container').removeClass('sticky');
      $('.s-nav-container').attr('style', '');
      $('#resources-container').attr('style', '');
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
      // hide drawers
      $('#abs-full-txt-toggle').text('Full Text Sources');
      $('#abs-nav-menu-toggle').html(
        '<i class="fa fa-bars" aria-hidden="true"></i> Show Menu'
      );
      $('.s-nav-container').removeClass('show');
      $('#resources-container').removeClass('show');

      // Observe search bar
      if (!this.observing && document.querySelector('.s-search-bar-widget')) {
        this.observer.observe(document.querySelector('.s-search-bar-widget'));
        this.observing = true;
      }

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
      ShowFeedback__missingreferences: {
        title: 'Missing/Incorrect References',
        path: 'feedback/missingreferences',
        category: 'feedback',
        alwaysThere: 'true',
        order: 9,
      },
      ShowFeedback__associatedarticles: {
        title: 'Associated References',
        path: 'feedback/associatedarticles',
        category: 'feedback',
        alwaysThere: 'true',
        order: 10,
      },
      ShowFeedback__correctabstract: {
        title: 'Submit/Correct Abstract',
        path: 'feedback/correctabstract',
        category: 'feedback',
        alwaysThere: 'true',
        order: 11,
      },
    },
  });
  return PageManager;
});
