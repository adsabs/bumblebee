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
  function(
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

      initialize: function(options) {
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
      activate: function(beehive) {
        this.setBeeHive(beehive);
        var pubsub = this.getPubSub();
        pubsub.subscribe(pubsub.NAVIGATE, _.bind(this.navigate, this));
      },

      /**
       * Responds to PubSubEvents.NAVIGATE signal
       */
      navigate: function(ev, arg1, arg2) {

        if (!this.router || ! (this.router instanceof Backbone.Router)) {
          throw new Error('Navigator must be given \'router\' instance');
        }

        analytics('send', 'pageview', {
          page: ev
        });

        var transition = this.catalog.get(ev);
        if (!transition) {
          this.handleMissingTransition(arguments);
          return;
        }

        if (!transition.execute)
          return; // do nothing

        try {
          transition.execute.apply(transition, arguments);
        }
        catch (e) {
          this.handleTransitionError(transition, e, arguments);
        }

        //router can communicate directly with navigator to replace url
        var replace = ( transition.replace || arg1 && arg1.replace ) ? true : false;

        // don't reset the url if it is already correct, this could potentially
        // cause a safari browser bug

        if (decodeURI(window.location.hash) !== transition.route &&
            transition.route || transition.route === ""
        ) {
          // update the History object
          this.router.navigate(
              transition.route,
              { trigger: transition.trigger || false, replace: replace }
          );
        }

        //clear any metadata added to head on the previous page
        $("head").find("meta[data-highwire]").remove();
      },

      handleMissingTransition: function() {
        console.error("Cannot handle 'navigate' event: " + JSON.stringify(arguments));
        this.getPubSub().publish(this.getPubSub().BIG_FIRE, 'navigation-error', arguments);
      },

      handleTransitionError: function(transition, error, args) {
        console.error("Error while executing transition", transition, args);
        console.error(error.stack);
        this.getPubSub().publish(this.getPubSub().CITY_BURNING, 'navigation-error', arguments);
      },

      /**
       * Sets the transition inside the catalog; you can pass simplified
       * list of options or the Transition instance
       */
      set: function() {
        if (arguments.length == 1) {
          if (arguments[1] instanceof Transition) {
            return this.catalog.add(arguments[1]);
          }
          throw new Exception('You must be kiddin\' sir!');
        }
        else if (arguments.length == 2) {
          var endpoint = arguments[0];
          if (_.isFunction(arguments[1])) {
            return this.catalog.add(new Transition(endpoint, {execute: arguments[1]}));
          }
          else if (_.isObject(arguments[1]) && arguments[1].execute) {
            return this.catalog.add(new Transition(endpoint, arguments[1]));
          }
          else {
            throw new Exception('Himmm, I dont know how to create a catalog rule with this input:', arguments);
          }
        }
        else {
          //var args = array.slice.call(arguments, 1);
          throw new Exception('Himmm, I dont know how to create a catalog rule with this input:', arguments);
        }
      },

      get: function(endpoint) {
        return this.catalog.get(endpoint);
      }




    });

    _.extend(Navigator.prototype, Mixins.BeeHive);
    return Navigator;
});