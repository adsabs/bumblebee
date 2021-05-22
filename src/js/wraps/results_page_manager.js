define([
  'js/page_managers/controller',
  'js/page_managers/three_column_view',
  'hbs!js/page_managers/templates/results-page-layout',
  'js/mixins/side_bar_manager',
  'jquery',
  'utils',
], function(
  PageManagerController,
  PageManagerView,
  PageManagerTemplate,
  SideBarManagerMixin,
  $,
  utils
) {
  var PageManager = PageManagerController.extend({
    initialize: function() {
      PageManagerController.prototype.initialize.apply(this, arguments);
      this.resultsTimer = new utils.TimingEvent(
        'all-results-loaded',
        'workflow'
      );
      this.fullResultsTimer = new utils.TimingEvent(
        'all-results-and-auxillary-loaded',
        'workflow'
      );
      this._referrer = null;

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

    persistentWidgets: [
      'PubtypeFacet',
      'SearchWidget',
      'BreadcrumbsWidget',
      'Sort',
      'ExportDropdown',
      'VisualizationDropdown',
      'AffiliationFacet',
      'AuthorFacet',
      'DatabaseFacet',
      'RefereedFacet',
      'KeywordFacet',
      'BibstemFacet',
      'BibgroupFacet',
      'DataFacet',
      'VizierFacet',
      'GrantsFacet',
      'Results',
      'OrcidBigWidget',
      'QueryInfo',
      'GraphTabs',
      'OrcidSelector',
    ],

    activate: function() {
      PageManagerController.prototype.activate.apply(this, arguments);

      const ps = this.getPubSub();
      ps.subscribe(ps.START_SEARCH, _.bind(this.onStartSearch, this));
      ps.subscribe(ps.USER_ANNOUNCEMENT, _.bind(this.onUserUpdate, this));

      // calls the sideBarManager mixin init handler
      this.init();
    },

    // Make menu bar and menus sticky
    adjustStickyElements: function() {
      // if single column and actions buttons container reached top of viewport
      if (
        window.matchMedia('(max-width: 788px)').matches &&
        $('#search-results-sort').get(0) &&
        $('#search-results-sort')
          .get(0)
          .getBoundingClientRect().bottom <= 0
      ) {
        var height = $('#search-results-actions').outerHeight(true);
        this.stickElements(height);
      } else {
        this.unStickElements();
      }
    },

    stickElements: function(top) {
      // button container
      $('#search-results-actions').addClass('sticky');
      // add to library widget
      $('#query-info-container').attr(
        'style',
        `position:fixed;top:${top}px;right:0`
      );
    },

    unStickElements: function() {
      $('#search-results-actions').removeClass('sticky');
      $('#query-info-container').attr('style', '');
    },

    onStartSearch: function() {
      this.resultsTimer.start();
      this.fullResultsTimer.start();
    },

    onUserUpdate: function(event) {
      const user = this.getBeeHive().getObject('User');
      if (event === user.USER_SIGNED_OUT) {
        $('#results-actions-toggle').addClass('disabled');
        $('#query-info-container').removeClass('show');
        $('#results-actions-toggle').html('<i class="fa fa-book" alt="open actions"></i> Actions');
      }
    },

    createView: function(options) {
      options = options || {};
      options.template = options.template || PageManagerTemplate;
      return new PageManagerView({
        template: PageManagerTemplate,
      });
    },

    show: function() {
      const isLoggedIn = this.getBeeHive()
        .getObject('User')
        .isLoggedIn();
      var ret = PageManagerController.prototype.show.apply(this, arguments);
      var self = this;
      var button =
        '<a href="javascript:void(0);" class="back-button btn btn-sm btn-default"> <i class="fa fa-arrow-left" aria-hidden="true"></i> Start New Search</a>';
      var $btn = ret.$el.find('.s-back-button-container');
      $btn
        .empty()
        .off('click')
        .html(button);
      $btn.click(function() {
        var ps = self.getPubSub();
        ps.publish(ps.CUSTOM_EVENT, 'start-new-search');
        ps.publish(ps.NAVIGATE, self._referrer || 'index-page');
        self._referrer = null;
        return false;
      });

      // Observe the item above sticky menu disappears
      if (!this.observing && ret.$el.find('#search-results-sort')[0]) {
        this.observer.observe(ret.$el.find('#search-results-sort')[0]);
        this.observing = true;
      }

      // close any drawers
      const actionBtn = ret.$el.find('#results-actions-toggle')[0];
      actionBtn.innerHTML = '<i class="fa fa-book" alt="open actions"></i> Actions';
      if (!isLoggedIn) {
        actionBtn.classList.add('disabled');
      } else {
        actionBtn.classList.remove('disabled');
      }
      ret.$el.find('#query-info-container')[0].classList.remove('show');

      return ret;
    },

    provideContext: function(ctx) {
      if (ctx.referrer) {
        this._referrer = ctx.referrer;
      }
    },

    setUpIntercepts: function() {
      const widgets = [
        'AuthorFacet',
        'RefereedFacet',
        'DatabaseFacet',
        'GraphTabs',
      ];
      const interceptRequests = (widget) => {
        let wid = widget;

        // check if the widget contains other widgets (like graphTabs)
        if (widget.widgets && widget.widgets.length > 0) {
          wid = widget.widgets[0];
        }

        const wps = wid.getPubSub();
        const oldPublish = wps.publish;

        // override the publish method
        // intercept any requests and cache it
        wps.publish = (ev, ...args) => {
          if (ev === wps.DELIVERING_REQUEST && !this.getSidebarState()) {
            let to;

            // if there is a new search cycle, then stop watching for changes
            wps.subscribeOnce(wps.INVITING_REQUEST, () =>
              window.clearTimeout(to)
            );

            // check for changes to sidebar state
            const check = () => {
              if (this.getSidebarState()) {
                // if the sidebars are shown, then go forward with the request
                return oldPublish.call(wid, ev, ...args);
              }
              to = setTimeout(() => requestAnimationFrame(check), 1000);
            };
            check();

            // break out here so the request is caught
            return;
          }
          oldPublish.call(wid, ev, ...args);
        };
      };

      widgets.map((k) => interceptRequests(this.widgets[k]));
    },

    assemble: function() {
      var self = this;
      return PageManagerController.prototype.assemble
        .apply(this, arguments)
        .done(function() {
          self.setUpIntercepts();
          _.each(
            _.keys(self.widgets),
            function(w) {
              self.listenTo(
                self.widgets[w],
                'page-manager-event',
                _.bind(self.onPageManagerEvent, self, self.widgets[w])
              );
            },
            self
          );

          self.setSidebarState(self._getUpdateFromUserData());

          const defaultWidgets = [
            'Results',
            'AuthorFacet',
            'RefereedFacet',
            'DatabaseFacet',
            'GraphTabs',
          ];

          try {
            _.forEach(_.keys(self.widgets), (k) => {
              const w = self.widgets[k];

              const handler = () => {
                if (k === 'Results') {
                  self.resultsTimer.stop();
                }
                _.remove(defaultWidgets, (t) => t === k);
                if (defaultWidgets.length === 0) {
                  self.fullResultsTimer.stop();
                }
              };

              if (w.widgets && w.widgets.length > 0) {
                _.forEach(w.widgets, (sub) => {
                  sub.onIdle = handler;
                });
              }
              w.onIdle = handler;
            });
          } catch (e) {
            // do nothing
          }
        });
    },

    broadcastTo: _.curry(function(widgets, event) {
      var args = arguments;
      var wids = _.pick(this.widgets, widgets);
      _.each(wids, function(w) {
        w.trigger.apply(
          w,
          ['page-manager-message', event].concat(_.toArray(args).slice(2))
        );
      });
    }, 2),

    onPageManagerEvent: function(widget, event, data) {
      // this event is emitted from results widget
      if (event === 'side-bars-update') {
        this.setSidebarState(data);
      }
    },
  });

  _.extend(PageManager.prototype, SideBarManagerMixin);
  return PageManager;
});
