/* eslint-disable global-require */
/**
 * Options for the `test-manual` grunt task
 *
 * @module grunt/test-manual
 */

module.exports = function(grunt) {
  grunt.registerTask('generate-testrunner', function() {
    const done = this.async();
    const path = require('path');
    const RUNNER_FILE_PATH = 'test/test_manual.html';

    // grab all test files
    const specs = grunt.file
      .expand(
        {
          cwd: path.resolve('test/mocha/js/'),
        },
        [
          '**/*.spec.js',
          '!widgets/base_tree_view.spec.js',
          '!widgets/facet_zoomable_graph_view.spec.js',
          '!widgets/list_of_things_expanding.spec.js',
          '!widgets/multi_callback_widget.spec.js',
          '!widgets/similar_widget.spec.js',
          '!widgets/green_button_widget.spec.js',
          '!widgets/facet_graph_widget.spec.js',
          '!js/apps/bumblebox/**/*.js',
        ]
      )
      .map((p) => p.replace(/^/, 'test/mocha/js/').replace(/.js$/, ''));

    // generate path mappings for transpiled modules
    const mappings = grunt.file
      .expand(
        {
          cwd: path.resolve('_tmp/js'),
        },
        ['**/*.js']
      )
      .reduce((acc, m) => {
        m = m.replace(/^/, 'js/').replace(/.js$/, '');
        acc[m] = m.replace(/^js\//, '_tmp/js/');
        return acc;
      }, {});

    const config = {
      baseUrl: '../',
      paths: mappings,
    };

    const testRunnerHTML = `<html>
    <head>
      <meta charset="utf-8" />
      <title>Bumblebee Tests</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="../libs/mocha/mocha.css" />
      <link rel="stylesheet" href="../styles/css/styles.css" />
    </head>
    <body>
      <div id="mocha"></div>
      <script>
        // this forces the require config to not start the bumblebee application
        window.skipMain = true;
      </script>
      <script
        src="../libs/requirejs/require.js"
      ></script>
  
      <script>
        require({
          baseUrl: '../',
          deps: ['config/discovery.config'],
          paths: {
            'common.config': '../config/common.config',
            mocha: 'libs/mocha/mocha',
            chai: 'libs/chai/chai',
            sinon: 'libs/sinon/index',
          },
        }, ['mocha', 'chai', 'sinon'], function(mocha, chai) {
          // expose chai globals
          window.expect = chai.expect;
          window.assert = chai.assert;
          window.should = chai.should;
          window.normalizeSpace = (str) => str.replace(/\\s+/g, ' ').trim();
  
          // set testing global
          window.__BUMBLEBEE_TESTING_MODE__ = true;
  
          // setup mocha
          mocha.setup('bdd').reporter('html');
          mocha.suite.afterEach(function() {
            $('body>div:not(#mocha)').empty();
            document.title = 'Bumblebee Tests';
            location.hash = '';
            window.localStorage.clear();
            window.sessionStorage.clear();
          });
  
          // overwrite mocha's stdout to make sure it doesn't throw errors
          Mocha.process.stdout.write = () => {};
        });

        require(
          ${JSON.stringify(config, null, 2)}, 
          ${JSON.stringify(specs, null, 2)}, 
        function () {
          const runner = mocha.run();
          new Mocha.reporters.Spec(runner);
        })
      </script>
  
      <!-- Test Fixtures. -->
      <div id="fixtures" style="display: none; visibility: hidden;"></div>
      <div id="test-area"></div>
      <div id="test"></div>
      <div id="scratch"></div>
    </body>
  </html>
  `;
    if (grunt.file.exists(RUNNER_FILE_PATH)) {
      grunt.file.delete(RUNNER_FILE_PATH);
    }
    grunt.log.writeln('_tmp generated');
    grunt.file.write(RUNNER_FILE_PATH, testRunnerHTML);
    grunt.log.writeln(`Test runner generated at ${RUNNER_FILE_PATH}`);
    grunt.log.writeln(
      `open browser to http://localhost:8000/${RUNNER_FILE_PATH}`
    );
    done();
  });
};
