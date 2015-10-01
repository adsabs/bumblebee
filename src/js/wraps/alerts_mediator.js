
define([
    'underscore',
    'jquery',
    'js/components/alerts_mediator',
    'js/components/api_feedback',
    'js/widgets/widget_states',
    'js/components/alerts',
    'js/components/api_response'
  ],

  function (
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
        pubsub.subscribe(pubsub.APP_STARTED, _.bind(this.onAppStart, this));
      },

      onAlert: function(apiFeedback, psk) {
        this._dirty = true;
        AlertsMediator.prototype.onAlert.call(this, arguments);
      },

      onAppStart: function() {
        var self = this;
        setTimeout(function() {
          self.checkAndDisplaySiteMessage();
          self.timerId = setInterval(function() {
            self.checkAndDisplaySiteMessage();
          }, 3600 * 1000);

        }, 1000);
      },

      onDestroy: function() {
          clearInterval(this.timerId);
      },

      onStartSearch: function() {
        this._dirty = false;
      },

      checkAndDisplaySiteMessage: function() {
        var self = this;
        var user = self.getBeeHive().getObject("User");
        if (user) {
          user.getSiteConfig('site_wide_message')
            .done(function(val) {

              // no site-wide message
              if (!(val && _.isString(val)))
                return;

              // ignore it other alert is there
              if (self._dirty)
                return;

              // ignore if it was already seen
              if (user.isLoggedIn()) {
                var uData = user.getUserData();
                if (uData.last_seen_message == val)
                  return;
              }

              // if the user was not logged in, consult the local storage
              var storage = self.getBeeHive().getService('PersistentStorage');
              if (storage) {
                var msg = storage.get('last_seen_message');
                if (msg && msg == val) {
                  return;
                }
              }

              // display the site-wide message
              self.alert(new ApiFeedback({
                  msg: val + ' (<a id="dismissSiteWideMsg" href="foo">dismiss</a>)',
                  events: {
                    'click a#dismissSiteWideMsg': 'dismissed'
                  }
                }))
                .done(function (v) {
                  if (v == 'dismissed') {
                    if (user && user.isLoggedIn())
                      user.setMyADSData({'last_seen_message': val});
                    if (storage)
                      storage.set('last_seen_message', val);
                  }
                });
            });
        }
      }
    });


    return Mediator;

  });
