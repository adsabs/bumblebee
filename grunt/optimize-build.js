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
      var output = '// GENERATED FILE (edits will be overwritten)\n\n' +
        'module.exports =\n' + JSON.stringify(config, null, 2) + ';'
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
        stubModules: [],
        include: [
          "js/apps/discovery/main",
          "js/apps/discovery/navigator",
          "router",
          "utils",
          "js/bugutils/diagnostics",
          "js/components/alerts",
          "js/components/alerts_mediator",
          "js/components/api_feedback",
          "js/components/api_query",
          "js/components/api_query_updater",
          "js/components/api_request",
          "js/components/api_response",
          "js/components/api_targets",
          "js/components/app_storage",
          "js/components/application",
          "js/components/beehive",
          "js/components/csrf_manager",
          "js/components/default_request",
          "js/components/doc_stash_controller",
          "js/components/facade",
          "js/components/feedback_mediator",
          "js/components/generic_module",
          "js/components/history_manager",
          "js/components/json_response",
          "js/components/library_controller",
          "js/components/multi_params",
          "js/components/navigator",
          "js/components/persistent_storage",
          "js/components/pubsub_events",
          "js/components/pubsub_key",
          "js/components/query_mediator",
          "js/components/query_validator",
          "js/components/recaptcha_manager",
          "js/components/services_container",
          "js/components/session",
          "js/components/solr_params",
          "js/components/solr_response",
          "js/components/transition",
          "js/components/transition_catalog",
          "js/components/user",
          "js/mixins/add_secondary_sort",
          "js/mixins/api_access",
          "js/mixins/dependon",
          "js/mixins/discovery_bootstrap",
          "js/mixins/formatter",
          "js/mixins/hardened",
          "js/mixins/link_generator_mixin",
          "js/mixins/openurl_generator",
          "js/mixins/widget_mixin_method",
          "js/mixins/widget_state_manager",
          "js/mixins/widget_utility",
          "js/modules/orcid/module",
          "js/modules/orcid/orcid_api",
          "js/modules/orcid/profile",
          "js/modules/orcid/work",
          "js/page_managers/controller",
          "js/page_managers/master",
          "js/page_managers/one_column_view",
          "js/page_managers/three_column_view",
          "js/page_managers/toc_controller",
          "js/page_managers/toc_widget",
          "js/page_managers/view_mixin",
          "js/services/api",
          "js/services/default_pubsub",
          "js/services/pubsub",
          "js/services/storage",
          "js/widgets/alerts/widget",
          "js/widgets/base/base_widget",
          "js/widgets/classic_form/widget",
          "js/widgets/facet/graph-facet/widget",
          "js/widgets/facet/widget",
          "js/widgets/footer/widget",
          "js/widgets/navbar/widget",
          "js/widgets/paper_search_form/widget",
          "js/widgets/search_bar/search_bar_widget",
          "js/widgets/widget_states",
          "js/wraps/alerts_mediator",
          "js/wraps/discovery_mediator",
          "js/wraps/landing_page_manager/landing_page_manager"
        ]
      })

      writeOutConfig(config);
    });

    grunt.registerTask('applyIncludesToConfig', function () {
      var content = grunt.file.read('dist/discovery.config.js');
      content = content.toString();
      config = {};
      config.bundles = _.reduce(fullConfig, function (acc, v) {
        acc[v.options.name] = v.options.include;
        return acc;
      }, {});
      var out = '//GENERATED: \nrequirejs.config(' + JSON.stringify(config, null, 2) + ');'
      grunt.file.write('dist/discovery.config.js', content + '\n' + out);
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
