/**
 * Service which receives alerts, it can be used by both widgets and
 * trusted components. Its purpose is to communicate to users important
 * messages.
 */

define([
  'underscore',
  'jquery',
  'cache',
  'js/components/generic_module',
  'js/mixins/dependon',
  'js/components/api_feedback',
  'js/mixins/hardened',
  'js/components/alerts'
],
function (
  _,
  $,
  Cache,
  GenericModule,
  Dependon,
  ApiFeedback,
  Hardened,
  Alerts
) {
  var AlertsMediator = GenericModule.extend({
    initialize: function (options) {
      _.extend(this, _.pick(options, ['debug', 'widgetName']));
    },

    /**
       * This controller does need elevated beehive
       * and applicaiton
       *
       * @param beehive
       * @param app
       */
    activate: function (beehive, app) {
      this.setBeeHive(beehive);
      this.setApp(app);
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.ALERT, _.bind(this.onAlert, this));
      pubsub.subscribe(pubsub.NAVIGATE, _.bind(this.onNavigate, this));

      var widget = this.getWidget();
      if (!widget) {
        throw new Error('If you want to use AlertController, you also need to have a Widget capable of displaying the messages (default: AlertsWidget)');
      }
    },

    onNavigate: function (route) {
      var self = this;
      var pubSub = this.getPubSub();

      // Close any errors produced on the login page on the next page navigation
      if (route === 'authentication-page') {
        pubSub.subscribeOnce(pubSub.NAVIGATE, function () {
          var widget = self.getWidget();
          if (widget && widget.closeView) {
            widget.closeView();
          }
        });
      }
    },

    onAlert: function (apiFeedback, psk) {
      var self = this;
      var promise = this.alert(apiFeedback)
        .done(function (result) {
          if (_.isFunction(result)) {
            result();
            return;
          }

          // non-privileged components can reach alerts sending limited
          // definition of actions; we'll turn those into functions/actions

          if (_.isObject(result) && result.action) {
            switch (result.action) {
              case Alerts.ACTION.TRIGGER_FEEDBACK:
                self.getPubSub().publish(self.getPubSub().FEEDBACK, new ApiFeedback(result.arguments));
                break;
              case Alerts.ACTION.CALL_PUBSUB:
                self.getPubSub().publish(result.signal, result.arguments);
                break;
              default:
                throw new Error('Unknown action type:' + result);
            }

            // close the widget immediately
            if (self._widget && self._widget.closeView) {
              self._widget.closeView();
            }
          }
        });
      return promise;
    },

    getWidget: function () {
      var defer = $.Deferred();
      var self = this;

      if (this._widget) {
        defer.resolve(this._widget);
      }
      else {
        this.getApp()._getWidget(this.widgetName || 'AlertsWidget').done(function(widget) {
          self._widget = widget;
          defer.resolve(widget);
        })
      } 
      return defer.promise();
    },

    alert: async function (apiFeedback) {
      
      var w = await this.getWidget();

      if (!w) {
        var defer = $.Deferred();
        console.warn('"AlertsWidget" has disappeared, we cant display messages to the user');
        defer.reject('AlertsWidget has disappeared');
        return defer.promise();
      }
      else {
        // return promise
        return w.alert(apiFeedback);
      }
      
    },

    hardenedInterface: {
      debug: 'state of the alerts',
      getHardenedInstance: 'allow to create clone of the already hardened instance'
    }
  });

  _.extend(AlertsMediator.prototype, Dependon.BeeHive, Dependon.App);
  _.extend(AlertsMediator.prototype, Hardened);

  return AlertsMediator;
});
