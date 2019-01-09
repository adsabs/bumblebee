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
    findNestedDependencies: false,
    create: true,
    paths: PATHS,
    stubModules: ['es6', 'babel']
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

    var writeOutConfig = function (config, done) {
      var output = `
        // GENERATED FILE (edits will be overwritten)
        module.exports = ${ JSON.stringify(config, null, 2) };
      `;
      fullConfig = config;
      grunt.file.write(path.resolve(__dirname, 'requirejs.js'), output);
      (function check(i) {
        if (i >= 30 || grunt.file.exists(path.resolve(__dirname, 'requirejs.js'))) {
          grunt.log.writeln('Configuration Generated...');
          return done();
        }
        setTimeout(check, 500, ++i);
      })(0);
    };

    grunt.registerTask('generateConfig', function () {
      var config = {};
      var done = this.async();
      var addConfig = function (name, cfg) {
        config[name] = {};
        config[name].options = _.extend({}, baseConfig, {
          name: name + '.bundle',
          out: 'dist/' + name + '.bundle.js'
        }, cfg);
      }

      addConfig('app', {
        include: [
          "analytics",
          "backbone-validation",
          "backbone",
          "bootstrap",
          "cache",
          "create-react-class",
          "d3-cloud",
          "d3",
          "discovery.vars",
          "es5-shim",
          "google-analytics",
          "hbs",
          "hbs/handlebars",
          "hbs/json2",
          "hbs/underscore",
          "jquery-ui",
          "jquery",
          "js/apps/discovery/main",
          "js/apps/discovery/navigator",
          "js/bugutils/diagnostics",
          "js/components/alerts_mediator",
          "js/components/alerts",
          "js/components/api_feedback",
          "js/components/api_query_updater",
          "js/components/api_query",
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
          "js/components/transition_catalog",
          "js/components/transition",
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
          "js/widgets/alerts/modal_view",
          "js/widgets/alerts/page_top_alert",
          "js/widgets/alerts/widget",
          "js/widgets/base/base_widget",
          "js/widgets/classic_form/widget",
          "js/widgets/facet/actions",
          "js/widgets/facet/create_store",
          "js/widgets/facet/factory",
          "js/widgets/facet/graph-facet/widget",
          "js/widgets/facet/reducers",
          "js/widgets/facet/widget",
          "js/widgets/footer/widget",
          "js/widgets/navbar/widget",
          "js/widgets/paper_search_form/topterms",
          "js/widgets/paper_search_form/widget",
          "js/widgets/search_bar/autocomplete",
          "js/widgets/search_bar/search_bar_widget",
          "js/widgets/widget_states",
          "js/wraps/alerts_mediator",
          "js/wraps/discovery_mediator",
          "js/wraps/landing_page_manager/landing_page_manager",
          "jsonpath",
          "libs/select2/matcher",
          "marionette",
          "moment",
          "persist-js",
          "react-dom",
          "react-prop-types",
          "react-redux",
          "react",
          "redux-thunk",
          "redux",
          "router",
          "select2",
          "sprintf",
          "underscore",
          "utils",

          // this is for results-page; once we are building separate bundles
          "clipboard",
          "filesaver",
          "immutable",
          "js/mixins/add_stable_index_to_collection",
          "js/mixins/papers_utils",
          "js/mixins/user_change_rows",
          "js/modules/orcid/extension",
          "js/widgets/abstract/widget",
          "js/widgets/api_query/widget",
          "js/widgets/bubble_chart/widget",
          "js/widgets/citation_helper/widget",
          "js/widgets/config",
          "js/widgets/dropdown-menu/widget",
          "js/widgets/facet/graph-facet/base_graph",
          "js/widgets/facet/graph-facet/h_index_graph",
          "js/widgets/facet/graph-facet/year_graph",
          "js/widgets/filter_visualizer/widget",
          "js/widgets/list_of_things/item_view",
          "js/widgets/list_of_things/model",
          "js/widgets/list_of_things/paginated_view",
          "js/widgets/list_of_things/widget",
          "js/widgets/metrics/d3-tip",
          "js/widgets/metrics/extractor_functions",
          "js/widgets/metrics/widget",
          "js/widgets/network_vis/network_widget",
          "js/widgets/query_info/query_info_widget",
          "js/widgets/results/widget",
          "js/widgets/tabs/tabs_widget",
          "js/widgets/wordcloud/widget",
          "js/wraps/affiliation_facet",
          "js/wraps/author_facet",
          "js/wraps/author_network",
          "js/wraps/bibgroup_facet",
          "js/wraps/bibstem_facet",
          "js/wraps/data_facet",
          "js/wraps/database_facet",
          "js/wraps/export_dropdown",
          "js/wraps/graph_tabs",
          "js/wraps/keyword_facet",
          "js/wraps/ned_object_facet",
          "js/wraps/paper_network",
          "js/wraps/pubtype_facet",
          "js/wraps/refereed_facet",
          "js/wraps/results_page_manager",
          "js/wraps/simbad_object_facet",
          "js/wraps/visualization_dropdown",
          "js/wraps/vizier_facet",
          //"mathjax",
          "redux-immutable",
        ]
      });

      writeOutConfig(config, done);
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

    grunt.task.run(['clean:release', 'copy:release', 'generateConfig', 'requirejs']);
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
