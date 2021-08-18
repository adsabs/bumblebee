module.exports = function(grunt) {
  var PATHS = {
    'backbone-validation': 'empty:',
    'backbone.stickit': 'empty:',
    'backbone.wreqr': 'empty:',
    backbone: 'empty:',
    bootstrap: 'empty:',
    bowser: 'empty:',
    classnames: 'empty:',
    clipboard: 'empty:',
    'create-react-class': 'empty:',
    'd3-cloud': 'empty:',
    d3: 'empty:',
    filesaver: 'empty:',
    'google-recaptcha': 'empty:',
    'google-analytics': 'empty:',
    jquery: 'empty:',
    'jquery-ui': 'empty:',
    'jquery-querybuilder': 'empty:',
    jsonpath: 'empty:',
    marionette: 'empty:',
    mathjax: 'empty:',
    moment: 'empty:',
    'persist-js': 'empty:',
    'react-bootstrap': 'empty:',
    'react-dom': 'empty:',
    'prop-types': 'empty:',
    'react-redux': 'empty:',
    react: 'empty:',
    'redux-thunk': 'empty:',
    redux: 'empty:',
    requirejs: 'empty:',
    reselect: 'empty:',
    select2: 'empty:',
    sinon: 'empty:',
    sprintf: 'empty:',
    underscore: 'empty:',
    'discovery.vars': 'empty:',
    yup: 'empty:',
    'react-hook-form': 'empty:',
    'react-flexview': 'empty:',
    'styled-components': 'empty:',
    'react-is': 'empty:',
    'react-data-table-component': 'empty:',
    'react-window': 'empty:',
    'react-async': 'empty:',
    diff: 'empty:',
    hotkeys: 'empty:',
    'react-transition-group': 'empty:',
    'regenerator-runtime': 'empty:',
    '@hookform/resolvers': 'empty:',
  };

  var baseConfig = {
    waitSeconds: 0,
    logLevel: 1,
    baseUrl: 'dist',
    optimize: 'none',
    mainConfigFile: 'dist/config/discovery.config.js',
    deps: [],
    findNestedDependencies: false,
    create: true,
    paths: PATHS,
    stubModules: ['es6', 'babel'],
  };

  grunt.registerMultiTask(
    'optimize-build',
    'Generate config and optimize build',
    function() {
      var _ = require('lodash');
      var path = require('path');
      var fullConfig = {};

      // callback called with URL and name pulled from folder
      var getByGlob = function(globs, cb) {
        var urls = [];
        grunt.file.expand({ filter: 'isFile' }, globs).forEach(function(url) {
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

      var writeOutConfig = function(config, done) {
        var output = `
        // GENERATED FILE (edits will be overwritten)
        module.exports = ${JSON.stringify(config, null, 2)};
      `;
        fullConfig = config;
        grunt.file.write(path.resolve(__dirname, 'requirejs.js'), output);
        (function check(i) {
          if (
            i >= 30 ||
            grunt.file.exists(path.resolve(__dirname, 'requirejs.js'))
          ) {
            grunt.log.writeln('Configuration Generated...');
            return done();
          }
          setTimeout(check, 500, ++i);
        })(0);
      };

      grunt.registerTask('generateConfig', function() {
        var config = {};
        var done = this.async();
        var addConfig = function(name, cfg) {
          config[name] = {};
          config[name].options = _.extend(
            {},
            baseConfig,
            {
              name: `${name}.bundle`,
              out: `dist/config/${name}.bundle.js`,
            },
            cfg
          );
        };

        const globFiles = (arrOfPaths) => {
          const filter = (path) => {
            // filter out all es6 modules, for now
            return !/\.jsx\.js$/.test(path);
          };

          return grunt.file
            .expand({ cwd: 'dist', filter }, arrOfPaths)
            .map((path) => {
              return path.replace(/\.js$/, '');
            });
        };

        addConfig('landing-page', {
          include: [
            ...globFiles([
              'js/react/Recommender/**/*.js',
              'js/widgets/paper_search_form/**/*.js',
              'js/widgets/search_bar/**/*.js',
              'js/widgets/facet/**/*.js',
              'js/widgets/alerts/**/*.js',
            ]),
            'js/widgets/base/base_widget',
            'js/widgets/classic_form/widget',
            'js/widgets/footer/widget',
            'js/widgets/navbar/widget',
            'js/widgets/widget_states',
            'js/wraps/alerts_mediator',
            'js/wraps/discovery_mediator',
            'js/wraps/landing_page_manager/landing_page_manager',
          ],
        });

        addConfig('search-page', {
          include: [
            ...globFiles([
              'js/wraps/*_facet.js',
              'js/widgets/metrics/**/*.js',
              'js/widgets/list_of_things/**/*.js',
              'js/widgets/search_bar/**/*.js',
              'js/widgets/facet/**/*.js',
              'js/widgets/alerts/**/*.js',
            ]),
            'js/widgets/abstract/widget',
            'js/widgets/api_query/widget',
            'js/widgets/base/base_widget',
            'js/widgets/bubble_chart/widget',
            'js/widgets/citation_helper/widget',
            'js/widgets/dropdown-menu/widget',
            'js/widgets/filter_visualizer/widget',
            'js/widgets/footer/widget',
            'js/widgets/navbar/widget',
            'js/widgets/network_vis/network_widget',
            'js/widgets/query_info/query_info_widget',
            'js/widgets/results/widget',
            'js/widgets/tabs/tabs_widget',
            'js/widgets/widget_states',
            'js/widgets/wordcloud/widget',
            'js/wraps/alerts_mediator',
            'js/wraps/discovery_mediator',
            'js/wraps/export_dropdown',
            'js/wraps/graph_tabs',
            'js/wraps/results_page_manager',
            'js/wraps/visualization_dropdown',
            'libs/select2/matcher',
          ],
        });

        addConfig('abstract-page', {
          include: [
            ...globFiles([
              'js/wraps/*_facet.js',
              'js/widgets/metrics/**/*.js',
              'js/widgets/list_of_things/**/*.js',
              'js/widgets/search_bar/**/*.js',
              'js/widgets/facet/**/*.js',
              'js/widgets/alerts/**/*.js',
            ]),
            'js/widgets/abstract/widget',
            'js/widgets/base/base_widget',
            'js/widgets/footer/widget',
            'js/widgets/graphics/widget',
            'js/widgets/meta_tags/widget',
            'js/widgets/navbar/widget',
            'js/widgets/query_info/query_info_widget',
            'js/widgets/widget_states',
            'js/wraps/abstract_page_library_add/widget',
            'js/wraps/abstract_page_manager/abstract_page_manager',
            'js/wraps/alerts_mediator',
            'js/wraps/citations',
            'js/wraps/coreads',
            'js/wraps/discovery_mediator',
            'js/wraps/paper_export',
            'js/wraps/paper_metrics',
            'js/wraps/references',
            'js/wraps/sidebar-graphics-widget',
            'js/wraps/table_of_contents',
            'libs/select2/matcher',
          ],
        });

        addConfig('main', {
          include: [
            ...globFiles([
              'config/**/*.js',
              '!config/discovery.vars.js',
              '!config/shim.js',
              'js/apps/discovery/**/*.js',
              '!js/apps/discovery/router.js',
              'js/components/**/*.js',
              '!js/components/analytics.js',
              '!js/components/query_builder/**/*.js',
              'js/mixins/**/*.js',
              'js/modules/**/*.js',
              'js/page_managers/**/*.js',
              'js/services/**/*.js',
            ]),
            'analytics',
            'router',
            'utils',
            'recaptcha',
            'reactify',
            'js/bugutils/diagnostics',
            'js/react/BumblebeeWidget',

            // vendor libraries
            'cache',
            'hbs',
            'async',
            'hbs/handlebars',
            'hbs/json2',
            'hbs/underscore',
            'array-flat-polyfill',
            'regenerator-runtime',
            'hotkeys',
            'react-transition-group',
            '@hookform/resolvers',
          ],
        });

        writeOutConfig(config, done);
      });

      var getDiscoveryConfig = function() {
        var content = grunt.file.read('dist/config/discovery.config.js');
        var cfg = {};
        (function() {
          var require = (requirejs = {
            config: function(data) {
              cfg = data;
            },
          });
          eval(content.toString());
        })();
        return cfg;
      };

      var generateConfigFileString = function(name, cnts) {
        return `
/**
 * GENERATED FILE (edits will be overwritten):
 * This is the configuration for ${name}.
 */
requirejs.config(${JSON.stringify(cnts, null, 2)});
`;
      };

      grunt.registerTask('applyIncludesToConfig', function() {
        var cfg = getDiscoveryConfig();

        // generate the rest of the bundles
        _.forEach(fullConfig, function(bundle, name) {
          var _cfg = _.extend({}, cfg, {
            // set the main dependency to the bundle name
            deps: [`config/${bundle.options.name}`],

            // update the paths config with new revved names
            paths: _.extend(
              {},
              cfg.paths,

              // add all additional revved filenames to the paths
              _.reduce(
                bundle.options.include,
                function(acc, p) {
                  acc[p] = `config/${bundle.options.name}`;
                  return acc;
                },
                {}
              ),

              // some explicit path changes
              {
                'discovery.config': `config/${bundle.options.name}`,
              }
            ),
          });

          var out = generateConfigFileString(`dist/${name}.config.js`, _cfg);
          grunt.file.write(`dist/config/${name}.config.js`, out);
          grunt.log.writeln(`${name}.config.js has been created`);
        });
      });

      grunt.task.run(['generateConfig', 'babel:release', 'requirejs']);
      grunt.task.run(['applyIncludesToConfig']);
      // grunt.task.run(['uglify']);
    }
  );

  return {
    options: {},
    release: {},
  };
};
