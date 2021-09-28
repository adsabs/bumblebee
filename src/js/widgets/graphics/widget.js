define([
  'marionette',
  'js/widgets/base/base_widget',
  'js/components/api_request',
  'js/components/api_response',
  'js/components/api_query',
  'hbs!js/widgets/graphics/templates/grid',
  'hbs!js/widgets/graphics/templates/sidebar',
  'js/components/api_targets',
  'analytics',
], function(
  Marionette,
  BaseWidget,
  ApiRequest,
  ApiResponse,
  ApiQuery,
  gridTemplate,
  sidebarTemplate,
  ApiTargets,
  analytics
) {
  var GraphicsModel = Backbone.Model.extend({
    defaults: function() {
      return {
        graphics: undefined,
        title: undefined,
        linkSentence: undefined,
      };
    },
  });

  var GridView = Marionette.ItemView.extend({
    template: gridTemplate,

    className: 's-graphics-grid',

    events: {
      'click .graphics-external-link': 'fireAnalyticsEvent',
    },

    modelEvents: {
      change: 'render',
    },

    fireAnalyticsEvent(ev) {
      analytics(
        'send',
        'event',
        'interaction',
        'graphics-link-followed',
        ev.currentTarget.href,
        {
          transport: 'beacon',
        }
      );
    },
  });

  var SidebarView = Marionette.ItemView.extend({
    template: sidebarTemplate,

    className: 's-graphics-sidebar graphics-sidebar',

    modelEvents: {
      'change:graphics': 'render',
    },

    triggers: {
      'click .graphics-container': 'showGraphicsGrid',
    },

    serializeData: function() {
      var graphics = this.model.toJSON().graphics;
      if (graphics) {
        return { sampleGraphic: graphics[_.keys(graphics)[0]].thumbnail };
      }

      return { sampleGraphic: undefined };
    },
  });

  var GraphicsWidget = BaseWidget.extend({
    initialize: function(options) {
      options = options || {};
      this.model = new GraphicsModel();
      this.view =
        options.sidebar === true
          ? new SidebarView({ model: this.model })
          : new GridView({ model: this.model });
      BaseWidget.prototype.initialize.apply(this, arguments);
    },

    activate: function(beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();
      _.bindAll(this, ['processResponse', 'onDisplayDocuments']);
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.onDisplayDocuments);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
    },

    onDisplayDocuments(apiQuery) {
      const bibcode = this.parseIdentifierFromQuery(apiQuery);

      if (bibcode === null) {
        return;
      }

      if (this._bibcode === bibcode) {
        // if we are already loaded, just return here
        return;
      }
      this._bibcode = bibcode;

      // load graphics
      this.loadBibcodeData();

      if (!Marionette.getOption(this, 'sidebar')) {
        // if we aren't on the sidebar, then attempt to first grab the doc from stash
        // otherwise load it from solr
        const doc = this.getDocFromStash();
        doc !== null ? this.setTitle(doc.title) : this.loadTitle(apiQuery);
      }
    },

    setTitle(title) {
      this.model.set('title', Array.isArray(title) ? title[0] : title);
    },

    getDocFromStash() {
      if (!this.getBeeHive().hasObject('DocStashController')) {
        return null;
      }
      const docs = this.getBeeHive()
        .getObject('DocStashController')
        .getDocs();
      if (docs.length > 0) {
        const doc = docs.find((d) => d.bibcode === this._bibcode);
        if (typeof doc !== 'undefined') {
          return doc;
        }
      }
      return null;
    },

    loadTitle(apiQuery) {
      const query = apiQuery.clone();
      query.unlock();
      query.set({
        q: `identifier:${this._bibcode}`,
        fl: 'title',
      });
      const ps = this.getPubSub();
      const request = new ApiRequest({
        target: ApiTargets.SEARCH,
        query,
        options: {
          fail: (e) => this.onError(e),
        },
      });
      ps.publish(ps.EXECUTE_REQUEST, request);
    },

    onReceivedResponse() {
      // we have a response, set the widget as active
      this.trigger('page-manager-event', 'widget-ready', {
        isActive: true,
        widget: this,
      });
    },

    onError(e) {
      console.log(e);
      this.trigger('page-manager-event', 'widget-ready', {
        // this will set us to inActive and navigate to ShowAbstract
        shouldReset: true,
        isActive: false,
        widget: this,
      });
      this.model.clear();
    },

    processResponse(response) {
      try {
        const {
          // these are coming from /graphics
          figures = [],
          header,
          Error: error,

          // this will only be available if we did the title search
          response: { docs: [{ title = '' }] = [{}] } = {},
        } = response.toJSON();

        // check for an error property (this should be taken care of before processResponse)
        if (typeof error === 'string') {
          return this.onError(new Error(error));
        }

        // set the sidenav widget as "active"
        this.onReceivedResponse();

        this.setTitle(title);

        // process the response from /graphics
        const graphics = figures.reduce(
          (acc, { figure_label: label, images, figure_type: type }) => ({
            ...acc,
            [label]: {
              ...images[0],
              interactive: type === 'interactive',
            },
          }),
          {}
        );

        // only set values if we had data
        if (figures.length > 0) {
          this.model.set({
            graphics,
            linkSentence: header,
          });
        }
      } catch (e) {
        this.onError(e);
      }
    },

    // load data, return a promise
    loadBibcodeData() {
      const ps = this.getPubSub();
      const request = new ApiRequest({
        target: `${ApiTargets.GRAPHICS}/${this._bibcode}`,
        query: new ApiQuery(),
        options: {
          done: (response) => {
            if (typeof response.Error === 'string') {
              this.onError(new Error('no results'));
            }
            this.processResponse({ toJSON: () => response });
          },
          fail: (e) => this.onError(e),
        },
      });
      ps.publish(ps.DELIVERING_REQUEST, request);
    },

    viewEvents: {
      showGraphicsGrid: 'triggerShowGrid',
    },

    triggerShowGrid: function() {
      this.getPubSub().publish(this.getPubSub().NAVIGATE, 'ShowGraphics', {
        href: '#abs/' + encodeURIComponent(this._bibcode) + '/graphics',
        bibcode: this._bibcode,
      });
    },
  });

  return GraphicsWidget;
});
