// Main config file for the Discovery application


require.config({


  // Initialize the application with the main application file or if we run
  // as a test, then load the test unittests
  deps: window.mocha ? [ window.mocha.testToLoad ? window.mocha.testToLoad : '../test/mocha/discovery.spec' ] : [ 'js/apps/discovery/main' ],

  // Configuration we want to make available to modules of ths application
  // see: http://requirejs.org/docs/api.html#config-moduleconfig
  'config': {
    'app': {
      regions: {
        foo: 'baz'
      }
    }
  },

  // Configuration for the facades (you can pick specific implementation, just for your
  // application) see http://requirejs.org/docs/api.html#config-map
  map: {
    '*': {
      'api_query_impl': 'js/components/solr_params',
      'api_response_impl': 'js/components/solr_response',
      'api_request_impl': 'js/components/default_request',
      'pubsub_service_impl': 'js/services/default_pubsub'
    }
  },

  paths: {

    // bumblebee components (here we'll lists simple names), paths are relative
    // to the config (the module that bootstraps our application; look at the html)
    // as a convention, all modules should be loaded using 'symbolic' names
    'config': './discovery.config',
    'app': 'js/apps/discovery/app',
    'main': 'js/apps/discovery/main',
    'router': 'js/apps/discovery/router',


    // Almond is used to lighten the output filesize.
    "almond": "libs/almond/almond",

    // Opt for Lo-Dash Underscore compatibility build over Underscore.
    "underscore": "libs/lodash/lodash.compat",

    // 3rd party dependencies
    'jquery': 'libs/jquery/jquery',
    'backbone': 'libs/backbone/backbone',
    'hbs': 'libs/require-handlebars-plugin/hbs',
    'marionette' : 'libs/marionette/backbone.marionette',
    'backbone.wreqr' : 'libs/backbone.wreqr/lib/backbone.wreqr',
    'backbone.eventbinder' : 'libs/backbone.eventbinder/backbone.eventbinder',
    'backbone.babysitter' : 'libs/backbone.babysitter/backbone.babysitter',
    'bootstrap': 'libs/bootstrap/bootstrap',
    'jquery-ui' : 'libs/jqueryui/jquery-ui',
    'd3':'libs/d3/d3',
    'hoverIntent': 'libs/jquery-hoverIntent/jquery.hoverIntent'

  },

  hbs : {
    'templateExtension' : 'html',

  },

  shim: {

    'bootstrap' : {
      deps: ['jquery']
    },
    // This is required to ensure Backbone works as expected within the AMD
    // environment.
    'backbone': {
      // These are the two hard dependencies that will be loaded first.
      deps: ['jquery', 'underscore'],

      // This maps the global `Backbone` object to `require('backbone')`.
      exports: 'Backbone'
    },

    marionette : {

      deps : ['jquery', 'underscore', 'backbone'],

      exports : 'Marionette'
    }
  }
});
