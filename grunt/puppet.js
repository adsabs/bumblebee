'use strict';
/**
 * Options for the `puppet` grunt task
 *
 * @module grunt/puppet
 */
module.exports = function(grunt) {
  grunt.registerMultiTask(
    'puppet',
    'find and run tests headlessly',
    async function() {
      const done = this.async();
      const COVERAGE_COLLECTION_FILE = 'test/coverage/coverage.json';
      const puppeteer = require('puppeteer');
      const path = require('path');
      const options = this.options({
        env: 'production',
        launchOptions: { headless: true },
      });

      // grab all the test files
      let specs = grunt.file
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

      // grab all the "coverage" mappings from dist, this way all the files
      // will already be transpiled/processed and we will be testing on stuff
      // closer to prod
      let mappings = {};
      if (options.env === 'production') {
        mappings = grunt.file
          .expand(
            {
              cwd: path.resolve('dist/js'),
            },
            ['**/*.js']
          )
          .reduce((acc, m) => {
            m = m.replace(/^/, 'js/').replace(/.js$/, '');
            acc[m] = m.replace(/^js\//, 'test/coverage/instrument/');
            return acc;
          }, {});
      } else {
        mappings = grunt.file
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
      }

      // start a headless browser session
      const browser = await puppeteer.launch(options.launchOptions);
      const page = await browser.newPage();
      await page.goto('http://localhost:8000/test/mocha/tests.html', {
        waitUntil: 'networkidle0',
      });
      await page.on('console', async (msg) => {
        const args = await Promise.all(
          msg.args().map(async (a) => await a.jsonValue())
        );
        typeof console[msg.type()] === 'undefined'
          ? console.log.apply(console, args)
          : console[msg.type()].apply(console, args);
      });

      await page.on('pageerror', async (error) => {
        if (error.message.indexOf('require is not defined') > -1) {
          console.log(
            '\n\n',
            'Restart the dev server using `grunt server` instead of `./server`'
          );
        }
      });

      try {
        // get the dependencies for testing, and setup globals
        await page.evaluate(() => {
          return new Promise((resolve) => {
            require(['mocha', 'chai', 'sinon'], (mocha, chai) => {
              // expose chai globals
              window.expect = chai.expect;
              window.assert = chai.assert;
              window.should = chai.should;
              window.normalizeSpace = (str) => str.replace(/\s+/g, ' ').trim();

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
              resolve();
            });
          });
        });
      } catch (e) {
        console.error(e);
      }

      let config = {
        baseUrl: '../../',
        paths: mappings,
      };
      if (options.env === 'production') {
        config = {
          ...config,
          config: {
            'test/coverage/instrument/components/persistent_storage': {
              namespace: 'bumblebee',
            },
          },
        };
      }

      try {
        // gather everything, load up tests and run mocha
        const result = await page.evaluate(
          (specs, config) => {
            return new Promise((resolve) => {
              // using the coverage mappings generated earlier, configure requirejs
              // to point to those instead
              require(config, specs, () => {
                const runner = mocha.run();
                new Mocha.reporters.Spec(runner);
                runner.on('end', () => resolve(runner.stats.failures === 0));
              });
            });
          },
          specs,
          config
        );

        // drop out if the result is false (tests failed) otherwise continue with coverage
        if (!result) {
          grunt.fail.fatal('Tests Failing', -1);
        } else if (options.env === 'production') {
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
            grunt.file.write(
              path.resolve(COVERAGE_COLLECTION_FILE),
              JSON.stringify(cvg)
            );
            console.log('Coverage File Written...');
          }
        }
      } catch (e) {
        console.error(e);
      }
      await browser.close();
      done();
    }
  );

  return {
    prod: {
      options: {
        env: 'production',
      },
    },
    dev: {
      options: {
        env: 'development',
      },
    },
    debug: {
      options: {
        env: 'development',
        launchOptions: { headless: false, devtools: true, slowMo: 250 },
      },
    },
  };
};
