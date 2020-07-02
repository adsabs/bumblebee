define([
  'underscore',
  'jquery',
  'js/components/generic_module',
  'js/mixins/dependon',
  'analytics',
  'js/components/pubsub_events',
], function(_, $, GenericModule, Dependon, analytics, PubsubEvents) {
  var Experiments = GenericModule.extend({
    initialize: function() {
      // store all metadata entries here
      this.isRunning = false;
    },

    activate: function(beehive, app) {
      this.setApp(app);
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();

      if (!window.gtag) {
        window.gtag = function() {
          if (_.isArray(window.dataLayer)) {
            window.dataLayer.push(arguments);
          }
        };
        window.gtag('event', 'optimize.callback', {
          callback: (value, name) => {
            console.log(
              'Experiment with ID: ' + name + ' is on variant: ' + value
            );
          },
        });
      }

      pubsub.subscribe(
        pubsub.APP_BOOTSTRAPPED,
        _.bind(this.onAppStarted, this)
      );
    },

    /**
     *
     * callback that can be used by external components; they can listen to BBB and then run their experiment
     *
     * */
    subscribe: function(event, callback) {
      var pubsub = this.getPubSub();
      if (PubsubEvents[event]) {
        pubsub.subscribe(PubsubEvents[event], callback);
      }
    },

    subscribeOnce: function(event, callback) {
      var pubsub = this.getPubSub();
      if (PubsubEvents[event]) {
        pubsub.subscribeOnce(PubsubEvents[event], callback);
      }
    },

    onAppStarted: function() {
      this.toggleOptimize();
    },

    toggleOptimize: function() {
      if (!window.dataLayer) {
        console.warn(
          'Optimize is not available, we are not running any experiment'
        );
        return;
      }

      if (this.isRunning) {
        window.dataLayer.push({ event: 'optimize.deactivate' });
      } else {
        window.dataLayer.push({ event: 'optimize.activate' });
      }
      this.isRunning = !this.isRunning;
    },
  });
  _.extend(Experiments.prototype, Dependon.BeeHive, Dependon.App);

  return Experiments;
})