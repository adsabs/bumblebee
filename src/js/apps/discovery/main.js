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

define(['config', 'module'], function(config, module) {

  require([
      'router',
      'js/components/application',
      'js/mixins/discovery_bootstrap',
      'js/mixins/api_access',
      'es5-shim'
    ],
    function(Router,
      Application,
      DiscoveryBootstrap,
      ApiAccess
      ) {
      Application.prototype.shim();

      // at the beginning, we don't know anything about ourselves...
      var debug = window.location.href.indexOf('debug=true') > -1 ? true : false;

      // app object will load everything
      var app = new (Application.extend(DiscoveryBootstrap))({'debug': debug, timeout: 30000});

      // load the objects/widgets/modules (using discovery.config.js)
      var defer = app.loadModules(module.config());

      // after they are loaded; we'll kick off the application
      defer.done(function() {

        // this will activate all loaded modules
        app.activate();

        var pubsub = app.getService('PubSub');
        pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_LOADED);

        // set some important urls, parameters before doing anything
        app.configure();

        app.bootstrap().done(function (data) {

          app.onBootstrap(data);
          pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_BOOTSTRAPPED);

          pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_STARTING);
          app.start(Router);
          pubsub.publish(pubsub.getCurrentPubSubKey(), pubsub.APP_STARTED);

          //some global event handlers, not sure if right place
          $("body").on("click", "button.toggle-menu", function(e){
                        var $button = $(e.target),
                             $sidebar =  $button.parents().eq(1).find(".nav-container");

                        $sidebar.toggleClass("show");
                        var text = $sidebar.hasClass("show") ? '  <i class="fa fa-close"></i> Close Menu' : ' <i class="fa fa-bars"></i> Show Menu';
                        $button.html(text);
                     });
          //accessibility: skip to main content
          $("body").on("click", "#skip-to-main-content", function(e){
            e.preventDefault();
          });

          var dynConf = app.getObject('DynamicConfig');
          if (dynConf && dynConf.debugExportBBB) {
            console.log('Exposing Bumblebee as global object: window.bbb');
            window.bbb = app;
          }

        }).fail(function () {
          app.redirect('/500.html');
        });

      }).fail(function() {
        if (debug){
          //so error messages remain in the console
          return
        }
        // if we failed loading, retry *once again* (and give up eventually)
        app.reload('/404.html');
      });

    });




});
