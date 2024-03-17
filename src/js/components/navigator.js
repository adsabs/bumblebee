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

define([
  'underscore',
  'jquery',
  'cache',
  'js/components/generic_module',
  'js/mixins/dependon',
  'js/components/transition',
  'js/components/transition_catalog',
  'analytics',
], function (
  _,
  $,
  Cache,
  GenericModule,
  Mixins,
  Transition,
  TransitionCatalog,
  analytics,
) {
  // Document Title Constants
  var APP_TITLE = 'NASA/ADS';
  var TITLE_SEP = ' - ';

  // This function is used to hash the user id before sending it to Analytics
  const digestMessage = function (message) {
    const crypto = window.crypto || window.msCrypto;
    if (!crypto) {
      return Promise.reject(new Error('Crypto not available'));
    }
    // encode as (utf-8) Uint8Array
    const msgUi8 = new TextEncoder().encode(message);

    // hash the message
    return crypto.subtle.digest('SHA-256', msgUi8).then((hashBuffer) => {
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    });
  };

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
      this.storage = beehive.getObject('AppStorage');
      var pubsub = this.getPubSub();
      pubsub.subscribe(pubsub.NAVIGATE, _.bind(this.navigate, this));
      pubsub.subscribe(pubsub.CUSTOM_EVENT, _.bind(this._onCustomEvent, this));
      pubsub.subscribe(
        pubsub.USER_ANNOUNCEMENT,
        _.bind(this._onUserAnnouncement, this),
      );
    },

    _onUserAnnouncement: function (ev, data) {
      if (ev === 'user_signed_in' && typeof data === 'string') {
        // the user is signed in, we can associate the user with the session
        digestMessage(data).then((userIdHash) => {
          analytics('send', 'user_update', {
            user_id: userIdHash,
          });
        });
      }
    },

    _debouncedAnalyticsCall: _.debounce(function (...args) {
      analytics.push(...args)
    }, 500),

    _onCustomEvent: function (ev, data) {
      console.log('Custom Event', ev, data);

      switch (ev) {
        case 'update-document-title':
          this._updateDocumentTitle(data);
          break;
        case 'latest-abstract-data': {
          if (Array.isArray(data.database)) {
            analytics.set('items', undefined);
            data.database.forEach((database) => {
              // do not debounce here, since we want multiple
              analytics.push({
                event: 'view_item',
                items: [
                  {
                    item_id: data.bibcode,
                    item_name: data.title,
                    item_category: database,
                    index: data.resultsIndex,
                    refereed: data.property.includes('REFEREED'),
                  },
                ],
              });
            });
          } else {
            this._debouncedAnalyticsCall({
              event: 'view_item',
              items: [
                {
                  item_id: data.bibcode,
                  item_name: data.title,
                  item_category: '(no collection)',
                  index: data.resultsIndex,
                  refereed: data.property.includes('REFEREED'),
                },
              ],
            });
          }
          break;
        }
        case 'search-page-results':
          // clear items array on the data layer
          this._debouncedAnalyticsCall({
            event: 'view_item_list',
            item_list_id: 'search_results',
            item_list_name: 'Search Results',
            items: data.docs.map((doc) => {
              return {
                item_id: doc.identifier,
                item_name: doc.title[0],
                ...doc.database.slice(1).reduce(
                  (acc, cat, idx) => ({
                    ...acc,
                    [`item_category${idx + 1}`]: cat,
                  }),
                  {item_category: doc.database[0]},
                ),
                item_list_id: 'search_results',
                item_list_name: 'Search Results',
                item_variant: 'search_result_item',
                index: doc.resultsIndex,
                refereed: doc.property.includes('REFEREED'),
              };
            }),
          });
          break;
        default: // do nothing
      }
    },

    _cleanRoute: function (route) {
      const r = route.match(/[#\/]?([^\/]*)\//);
      if (r && r.length > 1) {
        return '/' + r[1];
      }
      return route;
    },

    _setPageAndEmitEvent: _.debounce(function (route, pageName) {
      analytics.reset();
      analytics('send', 'virtual_page_view', {
        page_name: pageName,
        clean_route: this._cleanRoute(route),
      });
    }, 300),

    /**
     * Responds to PubSubEvents.NAVIGATE signal
     */
    navigate: function (ev, arg1, arg2) {
      var defer = $.Deferred();
      var self = this;

      if (!this.router || !(this.router instanceof Backbone.Router)) {
        defer.reject(new Error("Navigator must be given 'router' instance"));
        return defer.promise();
      }

      var transition = this.catalog.get(ev);
      if (!transition) {
        this.handleMissingTransition(arguments);
        defer.reject(new Error('Missing route; going to 404'));
        return defer.promise();
      }

      if (!transition.execute) {
        // do nothing
        return defer.resolve().promise();
      }

      var afterNavigation = _.bind(function () {
        // router can communicate directly with navigator to replace url
        var replace = !!(transition.replace || (arg1 && arg1.replace));

        if (transition.route === '' || transition.route) {
          var route = transition.route === '' ? '/' : transition.route;
          this._setPageAndEmitEvent(route, ev);
          this.router.navigate(route, {
            trigger: false,
            replace: replace,
          });
        }

        // clear any metadata added to head on the previous page
        $('head')
        .find('meta[data-highwire]')
        .remove();
        this._updateDocumentTitle(transition.title);
        defer.resolve();
      }, this);

      var p;
      try {
        p = transition.execute.apply(transition, arguments);
        p && _.isFunction(p.then) ? p.then(afterNavigation) : afterNavigation();
      } catch (e) {
        this.handleTransitionError(transition, e, arguments);
        var err = new Error('Error transitioning to route; going to 404');
        return defer.reject(err).promise();
      }

      return defer.promise();
    },

    _updateDocumentTitle: function (title) {
      if (_.isUndefined(title) || title === false) return;
      var currTitle = this.storage.getDocumentTitle();
      var setDocTitle = _.bind(function (t) {
        document.title = t === '' ? APP_TITLE : t + TITLE_SEP + APP_TITLE;
        this.storage.setDocumentTitle(t);
      }, this);

      // title is defined and it is different from the current one, it should be updated
      if (title !== currTitle) {
        setDocTitle(title);
      }
    },

    handleMissingTransition: function (transition) {
      console.error(
        "Cannot handle 'navigate' event: " + JSON.stringify(arguments),
      );
      var ps = this.getPubSub();
      ps.publish(ps.BIG_FIRE, 'navigation-error', arguments);
      if (this.catalog.get('404')) ps.publish(ps.NAVIGATE, '404');
    },

    handleTransitionError: function (transition, error, args) {
      console.error('Error while executing transition', transition, args);
      console.error(error.stack);
      var ps = this.getPubSub();
      ps.publish(ps.CITY_BURNING, 'navigation-error', arguments);
      if (this.catalog.get('404')) ps.publish(ps.NAVIGATE, '404');
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
        throw new Error("You must be kiddin' sir!");
      } else if (arguments.length == 2) {
        var endpoint = arguments[0];
        if (_.isFunction(arguments[1])) {
          return this.catalog.add(
            new Transition(endpoint, {
              execute: arguments[1],
            }),
          );
        }
        if (_.isObject(arguments[1]) && arguments[1].execute) {
          return this.catalog.add(new Transition(endpoint, arguments[1]));
        }

        throw new Error(
          'Himmm, I dont know how to create a catalog rule with this input:',
          arguments,
        );
      } else {
        // var args = array.slice.call(arguments, 1);
        throw new Error(
          'Himmm, I dont know how to create a catalog rule with this input:',
          arguments,
        );
      }
    },

    get: function (endpoint) {
      return this.catalog.get(endpoint);
    },
  });

  _.extend(Navigator.prototype, Mixins.BeeHive);
  return Navigator;
});
