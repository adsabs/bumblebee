define([
    'underscore',
    'jquery',
    'backbone',
    'js/components/api_query',
    'js/mixins/dependon',
    'js/components/api_feedback',
    'js/components/api_request',
    'js/components/api_targets',
    'js/mixins/api_access',
    'js/components/api_query_updater'

  ],
  function (
    _,
    $,
    Backbone,
    ApiQuery,
    Dependon,
    ApiFeedback,
    ApiRequest,
    ApiTargets,
    ApiAccessMixin,
    ApiQueryUpdater
  ) {
    var Router = Backbone.Router.extend({

      initialize: function (options) {
        options = options || {};
        this.queryUpdater = new ApiQueryUpdater('Router');
      },

      execute: function (callback, args) {
        // only perform actions if history has started
        if (Backbone.History.started) {
          var route = Backbone.history.getFragment();
          route = route === '' ? 'index' : route;

          // Workaround for issue where hitting back button from the index page
          // goes to an empty `search/` route, so capture that here and go back 2
          if (route === 'search/' && _.isEmpty(_.reject(args, _.isUndefined))) {
            return Backbone.history.history.go(-2);
          }
        }

        if (_.isFunction(callback)) {
          callback.apply(this, args);
        }
      },

      activate: function (beehive) {
        this.setBeeHive(beehive);
        if (!this.hasPubSub()) {
          throw new Error('Ooops! Who configured this #@$%! There is no PubSub service!');
        }
      },

      /*
       * if you don't want the navigator to duplicate the route in history,
       * use this function instead of pubsub.publish(pubsub.NAVIGATE ...)
       * */

      routerNavigate: function (route, options) {
        var options = options || {};
        this.getPubSub().publish(this.getPubSub().NAVIGATE, route, options);
      },

      routes: {
        '/': 'index',
        '': 'index',
        'classic-form(/)': 'classicForm',
        'paper-form(/)': 'paperForm',
        'index/(:query)': 'index',
        'search/(:query)(/)(:widgetName)': 'search',
        'search(?:query)': 'search',
        'execute-query/(:query)': 'executeQuery',
        'abs/*path': 'view',
        /*
         * user endpoints require user to be logged in, either
         * to orcid or to ads
         * */
        'user/orcid*(:subView)': 'orcidPage',
        'user/account(/)(:subView)': 'authenticationPage',
        'user/account/verify/(:subView)/(:token)': 'routeToVerifyPage',
        'user/settings(/)(:subView)(/)': 'settingsPage',
        'user/libraries(/)(:id)(/)(:subView)(/)(:subData)(/)': 'librariesPage',
        'user/home(/)': 'homePage',
        /* end user routes */

        'orcid-instructions(/)': 'orcidInstructions',

        'public-libraries/(:id)(/)': 'publicLibraryPage',
        '*invalidRoute': 'noPageFound'
      },

      index: function (query) {
        this.routerNavigate('index-page');
      },

      classicForm: function () {
        this.routerNavigate('ClassicSearchForm');
      },

      paperForm: function () {
        this.routerNavigate('PaperSearchForm');
      },

      search: function (query, widgetName) {

        if (query) {
          try {
            var q = new ApiQuery().load(query);
            this.routerNavigate('search-page', {
              q: q,
              page: widgetName && 'show-' + widgetName,
              replace: true
            });
          } catch (e) {
            console.error('Error parsing query from a string: ', query, e);
            this.getPubSub().publish(this.getPubSub().NAVIGATE, 'index-page');
            this.getPubSub().publish(this.getPubSub().BIG_FIRE, new ApiFeedback({
              code: ApiFeedback.CODES.CANNOT_ROUTE,
              reason: 'Cannot parse query',
              query: query
            }));
            return this.getPubSub().publish(this.getPubSub().ALERT, new ApiFeedback({
              code: ApiFeedback.CODES.ALERT,
              msg: 'unable parse query',
              type: 'danger',
              modal: true
            }));
          }
        } else {
          this.getPubSub().publish(this.getPubSub().NAVIGATE, 'index-page');
        }
      },


      executeQuery: function (queryId) {
        this.getPubSub().publish(this.getPubSub().NAVIGATE, 'execute-query', queryId);
      },

      view: function (path) {
        if (!path) {
          return this.routerNavigate('404');
        }

        // break apart the path
        const parts = path.split('/');

        // check for a subpage
        let subPage;
        const subPageRegex = /^(abstract|citations|references|coreads|similar|toc|graphics|metrics|exportcitation)$/
        if (parts[parts.length - 1].match(subPageRegex)) {
          subPage = parts.pop();
        }

        // take the rest and combine into the identifier
        const id = parts.join('/');

        var navigateString, href;
        if (!subPage) {
          navigateString = 'ShowAbstract';
          href = '#abs/' + encodeURIComponent(id) + '/abstract';
        } else {
          navigateString = 'Show' + subPage[0].toUpperCase() + subPage.slice(1);
          href = '#abs/' + encodeURIComponent(id) + '/' + subPage;
        }
        this.routerNavigate(navigateString, {
          href: href,
          bibcode: id
        });
      },


      routeToVerifyPage: function (subView, token) {
        this.getPubSub().publish(this.getPubSub().NAVIGATE, 'user-action', {
          subView: subView,
          token: token
        });
      },

      orcidPage: function () {
        this.getPubSub().publish(this.getPubSub().NAVIGATE, 'orcid-page');
      },

      orcidInstructions: function () {
        this.getPubSub().publish(this.getPubSub().NAVIGATE, 'orcid-instructions');
      },

      authenticationPage: function (subView) {
        // possible subViews: "login", "register", "reset-password"
        if (subView && !_.contains(['login', 'register', 'reset-password-1', 'reset-password-2'], subView)) {
          throw new Error('that isn\'t a subview that the authentication page knows about');
        }
        this.routerNavigate('authentication-page', {
          subView: subView
        });
      },

      settingsPage: function (subView) {
        // possible subViews: "token", "password", "email", "preferences"
        if (_.contains(['token', 'password', 'email', 'delete'], subView)) {
          this.routerNavigate('UserSettings', {
            subView: subView
          });
        } else if (_.contains(['librarylink', 'orcid', 'application'], subView)) {
          // show preferences if no subview provided
          this.routerNavigate('UserPreferences', {
            subView: subView
          });
        } else if (_.contains(['libraryimport'], subView)) {
          this.routerNavigate('LibraryImport');

        } else if (_.contains(['myads'], subView)) {
          this.routerNavigate('MyAdsDashboard');
        } else {
          // just default to showing the library link page for now
          this.routerNavigate('UserPreferences', {
            subView: undefined
          });
        }
      },

      librariesPage: function (id, subView, subData) {
        if (id) {
          if (id === 'actions') {
            return this.routerNavigate('LibraryActionsWidget', 'libraries');
          }

          // individual libraries view
          var subView = subView || 'library';
          if (_.contains(['library', 'admin'], subView)) {
            this.routerNavigate('IndividualLibraryWidget', {
              subView: subView,
              id: id
            });
          } else if (_.contains(['export', 'metrics', 'visualization'], subView)) {
            subView = 'library-' + subView;

            if (subView == 'library-export') {
              this.routerNavigate(subView, {
                subView: subData || 'bibtex',
                id: id
              });
            } else if (subView == 'library-metrics') {
              this.routerNavigate(subView, {
                id: id
              });
            }
          } else {
            throw new Error('did not recognize subview for library view');
          }
        } else {
          // main libraries view
          this.routerNavigate('AllLibrariesWidget', 'libraries');
        }
      },

      publicLibraryPage: function (id) {
        // main libraries view
        this.getPubSub().publish(this.getPubSub().NAVIGATE, 'IndividualLibraryWidget', {
          id: id,
          publicView: true,
          subView: 'library'
        });
      },

      homePage: function (subView) {
        this.routerNavigate('home-page', {
          subView: subView
        });
      },

      noPageFound: function () {
        this.routerNavigate('404');
      },


      _extractParameters: function (route, fragment) {
        return _.map(route.exec(fragment).slice(1), function (param) {
          // do not decode api queries
          if (/q\=/.test(param)) {
            return param;
          }

          return param ? decodeURIComponent(param) : param;
        });
      }
    });

    _.extend(Router.prototype, Dependon.BeeHive, ApiAccessMixin);

    return Router;
  });
