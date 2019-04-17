'use strict';
/**
 * Options for the `puppet` grunt task
 *
 * @module grunt/puppet
 */
module.exports = function (grunt) {

  grunt.registerMultiTask('puppet', 'find and run tests headlessly', async function () {
    const done = this.async();
    const COVERAGE_COLLECTION_FILE = 'test/coverage/coverage.json'
    const path = require('path');
    const puppeteer = require('puppeteer');
    const progresscli = require('cli-progress');
    console.log();

    // create a progress bar to show
    const bar = new progresscli.Bar({
      format: '[{bar}] {percentage}% | {value}/{total} tests | {duration_formatted}',
      barCompleteChar: '\u2588',
      barIncompleteChar: '\u2591'
    }, progresscli.Presets.shades_classic);

    // grab all the test files
    let specs = grunt.file.expand({
      cwd: path.resolve('test/mocha/js/')
    }, [
      '**/*.spec.js',
      '!widgets/base_tree_view.spec.js',
      '!widgets/facet_zoomable_graph_view.spec.js',
      '!widgets/list_of_things_expanding.spec.js',
      '!widgets/multi_callback_widget.spec.js',
      '!widgets/similar_widget.spec.js',
      '!widgets/green_button_widget.spec.js',
      '!widgets/facet_graph_widget.spec.js'
    ]).map(p => p.replace(/^/, 'test/mocha/js/').replace(/.js$/, ''));

    // grab all the "coverage" mappings from dist, this way all the files
    // will already be transpiled/processed and we will be testing on stuff
    // closer to prod
    let coverageMappings = grunt.file.expand({
      cwd: path.resolve('dist/js')
    }, ['**/*.js']).reduce((acc, m) => {
      m = m.replace(/^/, 'js/').replace(/.js$/, '');
      acc[m] = m.replace(/^js\//, 'test/coverage/instrument/');
      return acc;
    }, {});

    // start a headless browser session
    const browser = await puppeteer.launch({ headless: true, devtools: false });
    const page = await browser.newPage();
    await page.goto('http://localhost:8000/test/mocha/tests.html', { waitUntil: 'networkidle0' });

    // expose some helper functions for handling update of the progress bar
    // and logging at the node level
    await page.exposeFunction('_start_', (...args) => bar.start.apply(bar, args));
    await page.exposeFunction('_increment_', (...args) => bar.increment.apply(bar, args));
    await page.exposeFunction('_stop_', (...args) => bar.stop.apply(bar, args));
    await page.exposeFunction('_setTotal_', (...args) => bar.setTotal.apply(bar, args));
    await page.exposeFunction('_log_', (...args) => console.log.apply(console, args));
    await page.exposeFunction('_err_', (...args) => console.error.apply(console, args));

    // gather everything, load up tests and run mocha
    const result = await page.evaluate((specs, coverageMappings) => {
      return new Promise(resolve => {

        // load up dependencies for testing
        require([
          'mocha', 'chai', 'sinon',
          '../../node_modules/es5-shim/es5-shim.min'
        ], (mocha, chai) => {

          // expose chai globals
          window.expect = chai.expect;
          window.assert = chai.assert;
          window.should = chai.should;
          window.normalizeSpace = (str) => str.replace(/\s+/g, ' ').trim();

          // setup mocha
          mocha.setup('bdd').reporter('html');
          mocha.suite.afterEach(function () {
            $('body>div:not(#mocha)').empty();
            document.title = 'Bumblebee Tests';
            location.hash = '';
            window.localStorage.clear();
            window.sessionStorage.clear();
          });

          // using the coverage mappings generated earlier, configure requirejs
          // to point to those instead
          require({
            baseUrl: '/',
            paths: coverageMappings,
            config: {
              'test/coverage/instrument/components/persistent_storage': {
                namespace: 'bumblebee'
              }
            }
          }, specs, () => {

            // overwrite mocha's stdout to make sure it doesn't throw errors
            Mocha.process.stdout.write = () => {};

            // recurse through suites to find the total number of tests
            const testCount = (function getCount(suite, tests) {
              tests += suite.tests.reduce((acc, t) => t.pending ? acc : acc + 1, 0);
              tests += suite.suites.reduce((acc, s) => acc + getCount(s, 0), 0);
              return tests;
            })(mocha.suite, 0);

            // run tests
            const runner = mocha.run();

            // create a new Base reporter, this does alot of the display work
            const base = new Mocha.reporters.Base(runner);
            _start_(testCount, 0);

            // increment the progress bar after each tests
            runner.on('test end', (test) => !test.pending && _increment_());
            runner.on('end', () => {

              // stop progress, and allow the base reporter to show epilogue (summary)
              _stop_();
              console.log = (...args) => _log_.apply(null, args);
              base.epilogue();
              resolve(runner.stats.failures === 0);
            });
          });
        });
      });
    }, specs, coverageMappings);

    // drop out if the result is false (tests failed) otherwise continue with coverage
    if (!result) {
      grunt.fail.fatal('Tests Failing', -1);
    } else {

      // grab the coverage result from the global object
      const coverage = await page.evaluateHandle('__coverage__');
      const cvg = await coverage.jsonValue();
      if (cvg) {

        // prefix coverage paths, to make sure they work with istanbul
        Object.keys(cvg).forEach((k) => {
          const path = k.replace(/^/, 'dist/js/');
          cvg[path] = { ...cvg[k], path: path };
          delete cvg[k];
        });

        // write out the coverage stuff
        grunt.file.write(path.resolve(COVERAGE_COLLECTION_FILE), JSON.stringify(cvg));
        console.log('Coverage File Written...');
      }
    }
    await browser.close();
    done();
  });

  return {
    options: {
      env: 'production'
    },
    all: {}
  }
};
