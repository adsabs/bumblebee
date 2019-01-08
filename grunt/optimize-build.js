module.exports = function (grunt) {

  var PATHS = {
    'backbone-validation': 'empty:',
    'backbone.stickit': 'empty:',
    'backbone.wreqr': 'empty:',
    'backbone': 'empty:',
    'bootstrap': 'empty:',
    'classnames': 'empty:',
    'clipboard': 'empty:',
    'create-react-class': 'empty:',
    'd3-cloud': 'empty:',
    'd3': 'empty:',
    'es5-shim': 'empty:',
    'filesaver': 'empty:',
    'google-analytics': 'empty:',
    'google-recaptcha': 'empty:',
    'jquery': 'empty:',
    'jquery-ui' : 'empty:',
    'jquery-querybuilder': 'empty:',
    'jsonpath': 'empty:',
    'marionette': 'empty:',
    'mathjax': 'empty:',
    'moment': 'empty:',
    'persist-js': 'empty:',
    'react-bootstrap': 'empty:',
    'react-dom' : 'empty:',
    'react-prop-types': 'empty:',
    'react-redux': 'empty:',
    'react' : 'empty:',
    'redux-thunk': 'empty:',
    'redux': 'empty:',
    'requirejs' : 'empty:',
    'reselect': 'empty:',
    'select2': 'empty:',
    'sinon': 'empty:',
    'sprintf': 'empty:',
    'underscore': 'empty:'
  };

  var baseConfig = {
    waitSeconds: 0,
    logLevel: 1,
    baseUrl: 'dist',
    optimize: 'none',
    mainConfigFile: 'dist/discovery.config.js',
    deps: [],
    stubModules: ['babel', 'es6'],
    findNestedDependencies: false,
    create: true,
    paths: PATHS
  };

  grunt.registerMultiTask('optimize-build', 'Generate config and optimize build', function () {
    var _ = require('lodash');
    var path = require('path');
    var fullConfig = {};

    // callback called with URL and name pulled from folder
    var getByGlob = function (globs, cb) {
      var urls = []
      grunt.file.expand({ filter: 'isFile' }, globs).forEach(function (url) {
        var parts = url.split(path.sep);
        if (/jsx\.js$/.test(url)) {
          url = url.replace(/^/, 'es6!');
        }
        url = url.replace('src/', '').replace(/\.js$/, '');
        urls.push(url);
        cb && cb(url, parts[3]);
      });
      return urls;
    };

    var writeOutConfig = function (config) {
      var output = `
        // GENERATED FILE (edits will be overwritten)
        module.exports = ${ JSON.stringify(config, null, 2) };
      `;
      fullConfig = config;
      grunt.file.write(path.resolve(__dirname, 'requirejs.js'), output);
      grunt.log.writeln('Configuration Generated...');
    };

    grunt.registerTask('generateConfig', function () {
      var config = {};
      var addConfig = function (name, cfg) {
        config[name] = {};
        config[name].options = _.extend({}, baseConfig, {
          name: name + '.bundle',
          out: 'dist/' + name + '.bundle.js'
        }, cfg);
      }

      addConfig('app', {
        include: [
          "js/apps/discovery/main",
          "router",
          "js/components/application",
          "js/mixins/discovery_bootstrap",
          "js/mixins/api_access",
          "es5-shim",
          "discovery.vars",
          "hbs/handlebars",
          "google-analytics",
          "underscore",
          "jquery",
          "js/components/api_query",
          "js/mixins/dependon",
          "js/components/api_feedback",
          "js/components/api_request",
          "js/components/api_targets",
          "js/components/api_query_updater",
          "js/components/beehive",
          "js/components/pubsub_events",
          "hbs",
          "d3",
          "js/components/solr_params",
          "js/components/facade",
          "js/components/default_request",
          "js/components/pubsub_key",
          "js/mixins/hardened",
          "analytics",
          "js/components/generic_module",
          "js/components/services_container",
          "hbs/underscore",
          "hbs/json2",
          "js/components/multi_params",
          "backbone",
          "backbone-validation",
          "d3-cloud",
          "js/wraps/discovery_mediator",
          "js/components/query_mediator",
          "js/bugutils/diagnostics",
          "js/wraps/alerts_mediator",
          "js/modules/orcid/module",
          "js/widgets/facet/factory",
          "js/services/api",
          "js/services/pubsub",
          "js/apps/discovery/navigator",
          "js/services/storage",
          "js/components/history_manager",
          "js/components/user",
          "js/components/session",
          "js/page_managers/master",
          "js/components/app_storage",
          "js/components/recaptcha_manager",
          "js/components/csrf_manager",
          "js/components/library_controller",
          "js/components/doc_stash_controller",
          "js/components/feedback_mediator",
          "js/widgets/widget_states",
          "js/components/alerts",
          "js/components/api_response",
          "js/mixins/add_secondary_sort",
          "js/components/json_response",
          "utils",
          "js/components/alerts_mediator",
          "js/modules/orcid/orcid_api",
          "js/widgets/facet/widget",
          "js/widgets/facet/graph-facet/widget",
          "js/services/default_pubsub",
          "moment",
          "js/components/persistent_storage",
          "js/components/navigator",
          "js/widgets/base/base_widget",
          "js/page_managers/controller",
          "cache",
          "sprintf",
          "marionette",
          "js/components/solr_response",
          "react",
          "react-dom",
          "react-redux",
          "js/widgets/facet/actions",
          "js/widgets/facet/reducers",
          "js/widgets/facet/create_store",
          "js/mixins/link_generator_mixin",
          "js/modules/orcid/work",
          "js/modules/orcid/profile",
          "js/components/transition",
          "js/components/transition_catalog",
          "js/mixins/widget_mixin_method",
          "js/mixins/widget_state_manager",
          "js/page_managers/three_column_view",
          "js/page_managers/view_mixin",
          "persist-js",
          "redux",
          "redux-thunk",
          "js/mixins/openurl_generator",
          "jsonpath",
          "js/mixins/widget_utility",
          "jquery-ui",
          "bootstrap",
          "create-react-class",
          "react-prop-types",
          "js/widgets/alerts/widget",
          "js/widgets/navbar/widget",
          "js/widgets/footer/widget",
          "js/widgets/alerts/modal_view",
          "js/widgets/alerts/page_top_alert",
          "js/wraps/landing_page_manager/landing_page_manager",
          "js/page_managers/toc_controller",
          "js/page_managers/one_column_view",
          "js/page_managers/toc_widget",
          "js/widgets/search_bar/search_bar_widget",
          "js/widgets/classic_form/widget",
          "js/widgets/paper_search_form/widget",
          "js/mixins/formatter",
          "js/widgets/search_bar/autocomplete",
          "js/components/query_validator",
          "select2",
          "libs/select2/matcher",
          "js/widgets/paper_search_form/topterms"
        ]
      });

      writeOutConfig(config);
    });

    grunt.registerTask('applyIncludesToConfig', function () {
      var content = grunt.file.read('dist/discovery.config.js');
      var cfg = {};
      (function () {
        var require = requirejs = {
          config: function (data) { cfg = data; }
        };
        eval(content.toString());
      })();

      _.forEach(fullConfig.app.options.include, function (val) {
        cfg.paths[val] = 'app.bundle';
      });

      // content = content.toString();
      // config = {};
      // config.bundles = _.reduce(fullConfig, function (acc, v) {
      //   acc[v.options.name] = v.options.include;
      //   return acc;
      // }, {});
      var out = '//GENERATED: \nrequire.config(' + JSON.stringify(cfg, null, 2) + ');'
      grunt.file.write('dist/discovery.config.js', out);
      grunt.log.writeln('discovery.config.js updated with bundle information');
    });

    grunt.task.run('generateConfig');
    grunt.task.run(['clean:release', 'copy:release', 'requirejs']);
    grunt.task.run('applyIncludesToConfig');
    // grunt.task.run('hash_require'); // still have to completely figure out
    grunt.task.run(['babel', 'uglify']);
  });

  return {
    options: {},
    release: {
    }
  };
};
