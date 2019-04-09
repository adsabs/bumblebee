define([
  'marionette',
  'js/widgets/base/base_widget',
  'js/components/api_request',
  'js/components/api_response',
  'js/components/api_query',
  'hbs!js/widgets/graphics/templates/grid',
  'hbs!js/widgets/graphics/templates/sidebar',
  'js/components/api_targets'


], function (
  Marionette,
  BaseWidget,
  ApiRequest,
  ApiResponse,
  ApiQuery,
  gridTemplate,
  sidebarTemplate,
  ApiTargets
) {
  var GraphicsModel = Backbone.Model.extend({

    defaults: function () {
      return {
        graphics: undefined,
        title: undefined,
        linkSentence: undefined
      };
    }

  });


  var GridView = Marionette.ItemView.extend({

    template: gridTemplate,

    className: 's-graphics-grid',

    modelEvents: {
      change: 'render'
    }

  });

  var SidebarView = Marionette.ItemView.extend({

    template: sidebarTemplate,

    className: 's-graphics-sidebar graphics-sidebar',

    modelEvents: {
      'change:graphics': 'render'
    },

    triggers: {
      'click .graphics-container': 'showGraphicsGrid'
    },

    serializeData: function () {
      var graphics = this.model.toJSON().graphics;
      if (graphics) {
        return { sampleGraphic: graphics[_.keys(graphics)[0]].thumbnail };
      }

      return { sampleGraphic: undefined };
    }
  });


  var GraphicsWidget = BaseWidget.extend({

    initialize: function (options) {
      options = options || {};
      this.model = new GraphicsModel();
      this.view = (options.sidebar === true) ? new SidebarView({ model: this.model }) : new GridView({ model: this.model });
      BaseWidget.prototype.initialize.apply(this, arguments);
    },

    activate: function (beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();
      _.bindAll(this, ['processResponse', 'onDisplayDocuments']);
      pubsub.subscribe(pubsub.DISPLAY_DOCUMENTS, this.onDisplayDocuments);
      pubsub.subscribe(pubsub.DELIVERING_RESPONSE, this.processResponse);
    },

    onDisplayDocuments: function (apiQuery) {
      var bibcode = apiQuery.get('q');
      var self = this;
      if (bibcode.length > 0 && /(identifier|bibcode):/.test(bibcode[0])) {
        bibcode = bibcode[0].replace(/(identifier|bibcode):/, '');
        this.loadBibcodeData(bibcode).done(function () {
          self.trigger('page-manager-event', 'widget-ready', { isActive: true, widget: self });
        });
        this.getResponseDeferred().fail(function () {
          self.trigger('page-manager-event', 'widget-ready', {

            // this will set us to inActive and navigate to ShowAbstract
            shouldReset: bibcode !== this._bibcode,
            isActive: false,
            widget: self
          });
          this._bibcode = bibcode;
        });
      }
    },

    // load data, return a promise
    loadBibcodeData: function (bibcode) {
      if (bibcode === this._bibcode) {
        this.deferredObject = $.Deferred();
        this.deferredObject.resolve(this.model);
        return this.deferredObject.promise();
      }

      this._bibcode = bibcode;
      this.deferredObject = $.Deferred();
      var request = new ApiRequest({
        target: ApiTargets.GRAPHICS + '/' + this._bibcode,
        query: new ApiQuery()
      });
      this.getPubSub().publish(this.getPubSub().DELIVERING_REQUEST, request);

      // now ask for the title if it's the main widget
      if (!Marionette.getOption(this, 'sidebar')) {
        var query = this.getCurrentQuery().clone();
        query.unlock();
        query.set('q', 'bibcode:' + bibcode);
        query.set('fl', 'title');

        var request = new ApiRequest({
          target: ApiTargets.SEARCH,
          query: query
        });
        this.getPubSub().publish(this.getPubSub().DELIVERING_REQUEST, request);
      }
      return this.deferredObject.promise();
    },

    getResponseDeferred: function () {
      if (!this._deferred || this._deferred.state() === 'resolved') {
        this._deferred = $.Deferred();
      }
      return this._deferred;
    },

    // if there is no data, there will be no response
    processResponse: function (response) {
      if (!(response instanceof ApiResponse)) {

        var responseDef = this.getResponseDeferred();
        // it's from the graphics service

        // was there data for the bibcode? if not, reject the deferred
        // response.get("Error") throws an uncaught error, not very convenient
        if (response.toJSON().Error) {
          // so we don't show old data if the new data hasn't returned
          this.model.clear();
          var error = response.get('Error');
          return responseDef.reject(error);
        }

        var graphics = {};
        _.each(response.get('figures'), function (dict) {
          graphics[dict.figure_label] = dict.images[0];

          // check for interactive graphics
          if (dict.figure_type === 'interactive') {
            graphics[dict.figure_label].interactive = true;
          }
        }, this);

        this.model.set({ graphics: graphics, linkSentence: response.get('header') });
      } else {
        var title = response.get('response.docs[0][\'title\']', false, '');
        title = (title && title.length) ? title[0] : '';
        this.model.set('title', title);
      }

      // resolving the promises generated by "loadBibcodeData"
      if (this.model.get('title') && this.model.get('graphics')) {
        this.deferredObject && this.deferredObject.resolve();
        responseDef && responseDef.resolve();
      }
    },

    viewEvents: {
      showGraphicsGrid: 'triggerShowGrid'
    },

    triggerShowGrid: function () {
      this.getPubSub().publish(this.getPubSub().NAVIGATE, 'ShowGraphics', {
        href: '#abs/' + encodeURIComponent(this._bibcode) + '/graphics',
        bibcode: this._bibcode
      });
    }

  });

  return GraphicsWidget;
});
