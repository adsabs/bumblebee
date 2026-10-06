define([
  'underscore',
  'jquery',
  'js/components/alerts_mediator',
  'js/components/api_feedback',
  'js/widgets/widget_states',
  'js/components/alerts',
  'js/components/api_response',
], function(
  _,
  $,
  AlertsMediator,
  ApiFeedback,
  WidgetStates,
  Alerts,
  ApiResponse
) {
  var Mediator = AlertsMediator.extend({
    activate: function(beehive, app) {
      AlertsMediator.prototype.activate.apply(this, arguments);
      var pubsub = this.getPubSub();
      pubsub.subscribe(
        pubsub.APP_STARTED,
        _.bind(this.displaySiteMessageWithDelay, this)
      );
    },

    onAlert: function(apiFeedback, psk) {
      this._dirty = true;
      AlertsMediator.prototype.onAlert.apply(this, arguments);
    },

    displaySiteMessageWithDelay: function() {
      var self = this;
      setTimeout(function() {
        self.checkAndDisplaySiteMessage();
      }, 500);
    },

    onDestroy: function() {
      clearInterval(this.timerId);
    },

    onStartSearch: function() {
      this._dirty = false;
    },

    checkAndDisplaySiteMessage: function() {
      var self = this;
      var user = self.getBeeHive().getObject('User');
      if (user) {
        user.getSiteConfig('site_wide_message').done(function(val) {
          var config = _.isObject(val) && !_.isArray(val) ? val : null;
          var message =
            _.isString(val) && val ? val : config && _.isString(config.msg) && config.msg ? config.msg : null;

          if (!message) return;

          // ignore it other alert is there
          if (self._dirty) return;

          var dismissable = !config || config.dismissable !== false;
          var storage = self.getBeeHive().getService('PersistentStorage');

          if (dismissable) {
            if (user.isLoggedIn()) {
              var uData = user.getUserData();
              if (uData.last_seen_message == message) return;
            }

            if (storage) {
              var seenMessage = storage.get('last_seen_message');
              if (seenMessage && seenMessage == message) {
                return;
              }
            }
          }

          self
            .alert(
              new ApiFeedback({
                msg: message,
                dismissable: config ? config.dismissable : undefined,
                bgColor: config ? config.bgColor : undefined,
                events: {
                  'click button.close': 'dismissed',
                },
              })
            )
            .done(function(v) {
              if (v == 'dismissed') {
                if (user && user.isLoggedIn())
                  user.setMyADSData({ last_seen_message: message });
                if (storage) storage.set('last_seen_message', message);
              }
            });
        });
      }
    },
  });

  return Mediator;
});
