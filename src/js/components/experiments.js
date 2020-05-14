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
      if (false) {
        pubsub.subscribe(pubsub.NAVIGATE, function(id) {
          if (id === 'SearchWidget') {
            window.bbb.getWidget('RecommenderWidget').then(function(w) {
              
              var user = bbb.getObject('User');
              var { tab, queryParams } = w.getState();
            
              // if user is not logged in, set some 'reader' value
              if (!user.isLoggedIn()) {
                  queryParams['reader'] = "X4a3ac72a9" // the most frequent reader; the best would be to have some ADS reader
                  w.dispatch({type: 'SET_QUERY_PARAMS', payload: queryParams});
              }
              else if (queryParams.reader) {
                  delete queryParams['reader'];
                  w.dispatch({type: 'SET_QUERY_PARAMS', payload: queryParams});
              }

              // modify the recommendations by using different algorithm
              if (true) {
                  queryParams['function'] = 'trending'
                  w.dispatch({type: 'SET_QUERY_PARAMS', payload: queryParams});
              }

              // activate recommendations
              if (!tab !== 1) {
                w.dispatch({ type: 'SET_TAB', payload: 1 });
              }
            });
          }
        });
      }
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
});
