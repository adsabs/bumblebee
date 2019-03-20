/**
/**
 * Created by rchyla on 3/10/14.
 */

/**
 * Mediator (event aggregator) to coordinate transitions/navigations
 * inside application. Each applications should have one 'navigator'
 * and one 'router' - the router is responsible for 'going into the
 * state directly' (ie. from a bookmarked ursl) and for updating the
 * history object. The rest is handled by the navigator. There is a
 * one-to-one relation between router<->navigator
 */

define(['underscore',
  'jquery',
  'cache',
  'js/components/generic_module',
  'js/mixins/dependon',
  'js/components/transition',
  'js/components/transition_catalog',
  'analytics'
],
function (
  _,
  $,
  Cache,
  GenericModule,
  Mixins,
  Transition,
  TransitionCatalog,
  analytics
) {
  var Navigator = GenericModule.extend({

    initialize: function (options) {
      options = options || {};
      this.router = options.router;
      this.catalog = new TransitionCatalog(); // catalog of nagivation points (later we can build FST)
    },

    /**
       * Starts listening on the PubSub
       *
       * @param beehive - the full access instance; we excpect PubSub to be
       *    present
       */
    activate: function (beehive) {
      this.setBeeHive(beehive);
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.NAVIGATE, _.bind(this.navigate, this));
    },

    /**
       * Responds to PubSubEvents.NAVIGATE signal
       */
    navigate: function (ev, arg1, arg2) {
      var defer = $.Deferred();
      var self = this;

      if (!this.router || !(this.router instanceof Backbone.Router)) {
        defer.reject(new Error('Navigator must be given \'router\' instance'));
        return defer.promise();
      }

      analytics('send', 'pageview', {
        page: ev
      });

      var transition = this.catalog.get(ev);
      if (!transition) {
        this.handleMissingTransition(arguments);
        defer.reject(new Error('Missing route; going to 404'));
        return defer.promise();
      }

      if (!transition.execute) { // do nothing
        return defer.resolve().promise();
      }

      var afterNavigation = _.bind(function() {

        // router can communicate directly with navigator to replace url
        var replace = !!((transition.replace || arg1 && arg1.replace));

        if (transition.route === '' || transition.route) {
          var route = transition.route === '' ? '/' : transition.route;
          this.router.navigate(route, { trigger: false, replace: replace });
        }

        // clear any metadata added to head on the previous page
        $('head').find('meta[data-highwire]').remove();
        var title = transition.title;
        var appTitle = 'NASA/ADS Search';
        if (document.title.indexOf(appTitle) > 0 && (!title || title === appTitle)) {
          title = document.title.split(' - ')[0];
        }
        document.title = (title ? title + ' - ' : '') + appTitle;
        defer.resolve();
      }, this);

      var p;
      try {
        p = transition.execute.apply(transition, arguments);
        (p && _.isFunction(p.then)) ? p.then(afterNavigation) : afterNavigation();
      } catch (e) {
        this.handleTransitionError(transition, e, arguments);
        var err = new Error('Error transitioning to route; going to 404');
        return defer.reject(err).promise();
      }

      return defer.promise();
    },

    handleMissingTransition: function (transition) {
      console.error('Cannot handle \'navigate\' event: ' + JSON.stringify(arguments));
      var ps = this.getPubSub();
      ps.publish(ps.BIG_FIRE, 'navigation-error', arguments);
      if (this.catalog.get('404'))
        ps.publish(ps.NAVIGATE, '404');
    },

    handleTransitionError: function (transition, error, args) {
      console.error('Error while executing transition', transition, args);
      console.error(error.stack);
      var ps = this.getPubSub();
      ps.publish(ps.CITY_BURNING, 'navigation-error', arguments);
      if (this.catalog.get('404'))
        ps.publish(ps.NAVIGATE, '404');
    },

    /**
       * Sets the transition inside the catalog; you can pass simplified
       * list of options or the Transition instance
       */
    set: function () {
      if (arguments.length == 1) {
        if (arguments[1] instanceof Transition) {
          return this.catalog.add(arguments[1]);
        }
        throw new Error('You must be kiddin\' sir!');
      } else if (arguments.length == 2) {
        var endpoint = arguments[0];
        if (_.isFunction(arguments[1])) {
          return this.catalog.add(new Transition(endpoint, { execute: arguments[1] }));
        }
        if (_.isObject(arguments[1]) && arguments[1].execute) {
          return this.catalog.add(new Transition(endpoint, arguments[1]));
        }

        throw new Error('Himmm, I dont know how to create a catalog rule with this input:', arguments);
      } else {
        // var args = array.slice.call(arguments, 1);
        throw new Error('Himmm, I dont know how to create a catalog rule with this input:', arguments);
      }
    },

    get: function (endpoint) {
      return this.catalog.get(endpoint);
    }
  });

  _.extend(Navigator.prototype, Mixins.BeeHive);
  return Navigator;
});
