/**
 * Discovery application: main bootstrapping routine
 *
 * Here we will bring up to life the discovery application,
 * all configuration is provided through the discovery.config.js
 *
 * Inside the config, there are sections for:
 *
 *  - where to find js libraries
 *  - which widgets to load (for this application)
 *  - which environmental variables are used
 *        (and how to bootstrap run-time values)
 *
 */

define(['discovery.config', 'module'], function (config, module) {
  require([
    'router',
    'js/components/application',
    'js/mixins/discovery_bootstrap',
    'js/mixins/api_access',
    'analytics',
    'es5-shim'
  ], function (Router,
    Application,
    DiscoveryBootstrap,
    ApiAccess,
    analytics) {
    var updateProgress = (typeof window.__setAppLoadingProgress === 'function')
      ? window.__setAppLoadingProgress : function () {};

    var timeStart = Date.now();

    Application.prototype.shim();

    // at the beginning, we don't know anything about ourselves...
    var debug = window.location.href.indexOf('debug=true') > -1;

    // app object will load everything
    var app = new (Application.extend(DiscoveryBootstrap))({
      debug: debug,
      timeout: 300000 // 5 minutes
    });

    // load the objects/widgets/modules (using discovery.config.js)
    var appPromise = app.loadModules(module.config());

    updateProgress(20, 'Starting Application');

    var startApp = function () {
      updateProgress(50, 'Modules Loaded');
      var timeLoaded = Date.now();

      analytics('send', 'event', 'timer', 'modules-loaded', timeLoaded - timeStart);

      // this will activate all loaded modules
      app.activate();

      var pubsub = app.getService('PubSub');
      pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_LOADED);

      // set some important urls, parameters before doing anything
      app.configure();

      updateProgress(95, 'Finishing Up...');
      app.bootstrap().done(function (data) {
        updateProgress(100);

        app.onBootstrap(data);
        pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_BOOTSTRAPPED);

        pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_STARTING);
        app.start(Router).done(function() {

          pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_STARTED);

          var getUserData = function () {
            try {
              var beehive = _.isFunction(this.getBeeHive) && this.getBeeHive();
              var user = _.isFunction(beehive.getObject) && beehive.getObject('User');
              if (user) {
                return user.getUserData('USER_DATA');
              }
            } catch (e) {
              // do nothing
            }
            return {};
          }

          // handle user preferences for external link actions
          var updateExternalLinkBehavior = _.debounce(function () {
            var userData = getUserData.call(app);
            var action = userData.externalLinkAction && userData.externalLinkAction.toUpperCase() || 'AUTO';
            if (action === 'OPEN IN CURRENT TAB') {
              var max = 10;
              var timeout;
              (function updateLinks(count) {
                clearTimeout(timeout);
                if (count < max) {
                  $('a[target="_blank"]').attr('target', '');
                  timeout = setTimeout(updateLinks, 1000, count + 1);
                }
              })(0);
            }
          }, 3000, { leading: true, trailing: false }, false);
          pubsub.subscribe(pubsub.getCurrentPubSubKey(), pubsub.NAVIGATE, updateExternalLinkBehavior);
          updateExternalLinkBehavior();

          analytics('send', 'event', 'timer', 'app-booted', Date.now() - timeLoaded);

          // some global event handlers, not sure if right place
          $('body').on('click', 'button.toggle-menu', function (e) {
            var $button = $(e.target),
              $sidebar = $button.parents().eq(1).find('.nav-container');

            $sidebar.toggleClass('show');
            var text = $sidebar.hasClass('show') ? '  <i class="fa fa-close"></i> Close Menu' : ' <i class="fa fa-bars"></i> Show Menu';
            $button.html(text);
          });

          // accessibility: skip to main content
          $('body').on('click', '#skip-to-main-content', function () {
            return false;
          });

          var dynConf = app.getObject('DynamicConfig');
          if (dynConf && dynConf.debugExportBBB) {
            console.log('Exposing Bumblebee as global object: window.bbb');
            window.bbb = app;
          }

            // apply a global link handler for push state
  
          var routes = [
            'classic-form',
            'paper-form',
            'index',
            'search',
            'execute-query',
            'abs',
            'user',
            'orcid-instructions',
            'public-libraries'
          ];
          var regx = new RegExp('^#(\/?(' + routes.join('|') + ').*\/?)?$', 'i');

          var $el = [];
          var transformHref = function (ev) {
            if (!Backbone.history
              || !Backbone.history.options
              || !Backbone.history.options.pushState
            ) return;
            $el = $(ev.currentTarget);
            var href = $el.attr('href');
            if (regx.test(href)) {
              var url = href.replace(/^\/?#\/?/, '/');
              $el.attr('href', url);
              return false;
            }
            $el = [];
          };

          var handleNavigation = function (el) {
            if ($el.length && window.bbb) {
              var href = $el.attr('href');

              // clear it so we don't have one lingering around
              $el = [];
              try {
                var nav = bbb.getBeeHive().getService('Navigator');
                nav.router.navigate(href, { trigger: true, replace: false });
                return false;
              } catch (e) {
                console.error(e.message);
              }
            }
            return true;
          };

          if (Backbone.history
            && Backbone.history.options
            && Backbone.history.options.pushState) {
              $(document)
                .on('mousedown', 'a', transformHref)
                .on('click', 'a', handleNavigation);
            }
          
          Backbone.history.on("all", function() {
            console.log('all-history', arguments);
          })

          Backbone.$(window).on('popstate', function() {
            console.log('pop-state', arguments);
          });
          
          Backbone.$(window).on('hashchange', function() {
            console.log('hash-change', arguments);
          });

          var oldUrl;
          setInterval(function() {
            if (oldUrl !== location.href) {
              console.log('oldUrl=', oldUrl, 'newUrl=', location.href)
              oldUrl = location.href;
            }
          }, 20);


          // app is loaded, send timing event

          if (__PAGE_LOAD_TIMESTAMP) {
            var time = new Date() - __PAGE_LOAD_TIMESTAMP;
            analytics('send', {
              hitType: 'timing',
              timingCategory: 'Application',
              timingVar: 'Loaded',
              timingValue: time
            });
            if (debug) {
              console.log('Application Started: ' + time + 'ms');
            }
          }
        });
      });
    };

    var failedLoad = function () {
      analytics('send', 'event', 'introspection', 'failed-load', arguments);

      if (!debug) {
        app.redirect('500.html');
      }
    };

    var failedReload = function () {
      analytics('send', 'event', 'introspection', 'failed-reloading', arguments);

      if (debug) {
        // so error messages remain in the console
        return;
      }
      // if we failed loading, retry *once again* (and give up eventually)
      app.reload('404.html');
    };

    // after they are loaded; we'll kick off the application
    appPromise
      .done(startApp)
      .fail(failedLoad)
      .fail(failedReload);
  });
});
