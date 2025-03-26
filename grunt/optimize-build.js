/* eslint-disable global-require */

module.exports = function(grunt) {
  const buildConfig = {
    options: {
      paths: {
        'array-flat-polyfill': 'empty:',
        'backbone-validation': 'empty:',
        'backbone.stickit': 'empty:',
        'backbone.wreqr': 'empty:',
        backbone: 'empty:',
        bootstrap: 'empty:',
        bowser: 'empty:',
        classnames: 'empty:',
        cache: 'empty:',
        clipboard: 'empty:',
        'create-react-class': 'empty:',
        'd3-cloud': 'empty:',
        d3: 'empty:',
        filesaver: 'empty:',
        'google-analytics': 'empty:',
        jquery: 'empty:',
        'jquery-ui': 'empty:',
        'jquery-querybuilder': 'empty:',
        jsonpath: 'empty:',
        marionette: 'empty:',
        mathjax: 'empty:',
        moment: 'empty:',
        'persist-js': 'empty:',
        polyfill: 'empty:',
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
        'react-aria-menubutton': 'empty:',
      },
      stubModules: ['es6', 'babel'],
    },
    release: {
      options: {
        bundles: {
          'landing-page': {
            files: [
              'js/wraps/*_facet.js',
              'js/widgets/metrics/**/*.js',
              'js/widgets/list_of_things/**/*.js',
              'js/widgets/search_bar/**/*.js',
              'js/widgets/facet/**/*.js',
              'js/widgets/alerts/**/*.js',
            ],
            requireModules: [
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
          },
          'search-page': {
            files: [
              'js/wraps/*_facet.js',
              'js/widgets/metrics/**/*.js',
              'js/widgets/list_of_things/**/*.js',
              'js/widgets/search_bar/**/*.js',
              'js/widgets/facet/**/*.js',
              'js/widgets/alerts/**/*.js',
            ],
            requireModules: [
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
          },
          'abstract-page': {
            files: [
              'js/wraps/*_facet.js',
              'js/widgets/metrics/**/*.js',
              'js/widgets/list_of_things/**/*.js',
              'js/widgets/search_bar/**/*.js',
              'js/widgets/facet/**/*.js',
              'js/widgets/alerts/**/*.js',
            ],
            requireModules: [
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
          },
          main: {
            files: [
              'config/**/*.js',
              '!config/discovery.vars.js',
              '!config/init.js',
              'js/apps/discovery/**/*.js',
              '!js/apps/discovery/router.js',
              'js/components/**/*.js',
              '!js/components/analytics.js',
              '!js/components/query_builder/**/*.js',
              'js/mixins/**/*.js',
              'js/modules/**/*.js',
              'js/page_managers/**/*.js',
              'js/services/**/*.js',
            ],
            requireModules: [
              'analytics',
              'router',
              'utils',
              'reactify',
              'js/bugutils/diagnostics',
              'js/react/BumblebeeWidget',
              'js/dark-mode-switch',

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
          },
        },
      },
    },
  };

  grunt.registerMultiTask(
    'optimize-build',
    'Generate config and optimize build',
    function() {
      const _ = require('lodash');
      const rjs = require('requirejs');
      const fullConfig = {};
      const options = this.options({
        waitSeconds: 30,
        logLevel: 4,
        baseUrl: 'dist',
        optimize: 'none',
        mainConfigFile: 'dist/config/discovery.config.js',
        deps: [],
        findNestedDependencies: false,
        create: true,
        bundles: {},
      });

      const { bundles, ...baseConfig } = options;

      // fail here if no bundles are passed
      if (Object.keys(options.bundles).length === 0) {
        return grunt.fail.fatal('No bundles configured');
      }

      /**
       * Generate the bundles based on the passed in config
       */
      grunt.registerTask('generateBundles', function() {
        const done = this.async();

        // log out a message on each successful completion
        const onBundleComplete = ({ name }) => {
          grunt.log.ok(`${name} generated!`);
        };

        // generate the config based on the base and bundle name
        const getConfig = (name, cfg) => ({
          ...baseConfig,
          name: `${name}.bundle`,
          out: `dist/config/${name}.bundle.js`,
          onModuleBundleComplete: onBundleComplete,
          ...cfg,
        });

        // expand file globs
        const expand = ({ files, requireModules }) => {
          const filter = (path) => {
            // filter out all es6 modules, for now
            return !/\.jsx\.js$/.test(path);
          };

          const paths = grunt.file
            .expand({ cwd: 'dist', filter }, files)
            .map((path) => {
              return path.replace(/\.js$/, '');
            });

          return [...paths, ...requireModules];
        };

        // wraps requirejs optimizer in promise
        const optimize = (name, modules) =>
          new Promise((res, rej) => {
            const config = getConfig(name, { include: modules });

            // update fullConfig variable (used in other task)
            fullConfig[name] = config;

            // call optimize on the configuration, passing in our promise handlers
            rjs.optimize(
              config,
              () => res(),
              (args) => rej(args)
            );
          });

        const promises = [];
        Object.keys(bundles).forEach((name) =>
          promises.push(optimize(name, expand(bundles[name])))
        );

        // wait on all the promises to finish, otherwise fail here
        Promise.all(promises)
          .catch((err) => grunt.fail.fatal(err))
          .finally(() => done());
      });

      const getDiscoveryConfig = function() {
        const content = grunt.file.read('dist/config/discovery.config.js', {
          encoding: 'utf-8',
        });
        let cfg = {};
        (function() {
          // mocks "require" in context for the eval call, this allows us to extract the config
          // eslint-disable-next-line no-unused-vars
          const require = {
            config(data) {
              cfg = data;
            },
          };

          // eslint-disable-next-line no-eval
          eval(content.toString());
        })();

        return cfg;
      };

      const generateConfigFileString = (name, contents) =>
        Buffer.from(
          `
/**
 * GENERATED FILE (edits will be overwritten):
 * This is the configuration for ${name}.
 */
requirejs.config(${JSON.stringify(contents)});
`,
          'utf-8'
        );

      /**
       * Generates the requirejs configs based on a default one which we grab first
       *
       * Basically we generate bundles above, which now need to be the target of several paths.  In
       * these generated configs, we point to our bundle (if necessary) otherwise leave it be.
       */
      grunt.registerTask('generateConfigs', function() {
        const cfg = getDiscoveryConfig();

        // generate the rest of the bundles
        _.forEach(fullConfig, function({ name, include }, moduleName) {
          const _cfg = _.extend({}, cfg, {
            // set the main dependency to the bundle name
            deps: [`config/${name}`],

            // update the paths config with new revved names
            paths: _.extend(
              {},
              cfg.paths,

              // add all additional revved filenames to the paths
              _.reduce(
                include,
                (acc, k) => ({ ...acc, [k]: `config/${name}` }),
                {}
              ),

              // some explicit path changes
              {
                'discovery.config': `config/${name}`,
              }
            ),
          });

          const out = generateConfigFileString(
            `dist/${moduleName}.config.js`,
            _cfg
          );
          grunt.file.write(`dist/config/${moduleName}.config.js`, out);
          grunt.log.writeln(`${moduleName}.config.js has been created`);
        });
      });

      grunt.task.run(['babel:release', 'generateBundles', 'generateConfigs']);
    }
  );

  return buildConfig;
};
