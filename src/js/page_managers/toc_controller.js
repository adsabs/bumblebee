define([
  'underscore',
  'marionette',
  './controller',
  './toc_widget',
  'analytics'
],
function (_, Marionette, BasicPageManagerController, TOCWidget, analytics) {
  /*
     * need to provide a toc template for the toc view when you inherit from this
     * */

  var PageManagerController = BasicPageManagerController.extend({


    createView: function (options) {
      if (this.pageConfig) {
        return new this.pageConfig.view(_.extend(options, { template: this.pageConfig.template }));
      }

      return BasicPageManagerController.prototype.createView.call(this, options);
    },


    assemble: function (app) {
      var defer = $.Deferred();

      if (!this.navConfig) {
        defer.reject(new Error('TOC widget is being assembled without navigation configuration (navConfig)'));
        return defer.promise();
      }

      if (this.assembled) {
        defer.resolve();
        return defer.promise();
      }

      var self = this;
      BasicPageManagerController.prototype.assemble.apply(this, arguments).done(function() {
        var tocTemplate = Marionette.getOption(self, 'TOCTemplate');

        if (self.TOCEvents) {
          // initiate the TOC view
          self.widgets.tocWidget = new TOCWidget(
            {
              template: tocTemplate,
              events: Marionette.getOption(self, 'TOCEvents'),
              navConfig: Marionette.getOption(self, 'navConfig')
            }
          );
        } else {
          // initiate the TOC view
          self.widgets.tocWidget = new TOCWidget({
            template: tocTemplate,
            navConfig: Marionette.getOption(self, 'navConfig')
          });
        }

        // insert the TOC nav view into its slot
        self.view.$('.nav-container').append(self.widgets.tocWidget.render().el);

        _.each(_.keys(self.widgets), function (w) {
          self.listenTo(this.widgets[w], 'page-manager-event', _.bind(this.onPageManagerEvent, this, this.widgets[w]));
          self.broadcast('page-manager-message', 'new-widget', w);
        }, self);
        defer.resolve();
      });

      return defer.promise();
    },


    /**
       * Listens to and receives signals from managed widgets.
       * It will discover their 'widgetId' and broadcasts the
       * data via a page-manager-message to all widgets in the
       * collection.
       *
       * @param event
       * @param data
       */
    onPageManagerEvent: function (widget, event, data) {
      data = data || {};
      var sender = null; var widgetId = null;

      // try to find/identify sender
      if (widget) {
        _.each(_.pairs(this.widgets), function (w) {
          if (w[1] === widget) {
            widgetId = w[0];
            sender = w[1];
          }
        });
      }

      if (event == 'widget-ready' && sender !== null) {
        data.widgetId = widgetId;
        this.broadcast('page-manager-message', event, data);
      } else if (event == 'widget-selected') {
        this.getPubSub().publish(this.getPubSub().NAVIGATE, data.idAttribute, data);

        var bibcode = widget.model.get('bibcode');
        var target = data.idAttribute.toLowerCase().replace('show', '');
        analytics('send', 'event', 'interaction', 'toc-link-followed', {
          target: target,
          bibcode: bibcode
        });
      } else if (event == 'broadcast-payload') {
        this.broadcast('page-manager-message', event, data);
      } else if (event == 'navigate') { // XXX:rca - why to almost equal events?
        this.getPubSub().publish(this.getPubSub().NAVIGATE, data.navCommand, data.sub);
      } else if (event == 'apply-function') { // XXX:rca - to remove
        data.func.apply(this);
      }
    },

    setActive: function (widgetName, subView) {
      // now inform the widget of the subView to show
      if (subView && this.widgets[widgetName].setSubView instanceof Function) {
        this.widgets[widgetName].setSubView(subView);
      }
      if (subView) {
        widgetName = widgetName + '__' + subView;
      }
      this.widgets.tocWidget.collection.selectOne(widgetName);
    },

    onDestroy: function () {
      this.stopListening();
      this.widgets = {};
      this.view.destroy();
    }

  });

  return PageManagerController;
});
