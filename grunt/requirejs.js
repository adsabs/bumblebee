'use strict';
/**
 * Options for the `requirejs` grunt task
 *
 * Task to minify modules/css; it should run only after files were
 * copied over to the 'dist' folder
 *
 * @module grunt/requirejs
 */

module.exports = function (grunt) {
  var createIncludePaths = function () {
    var s = grunt.file.read('src/discovery.config.js');
    require = {
      config: function(s) {
        return s;
      }
    };
    var bumblebeeConfig = eval(s).config['js/apps/discovery/main'];

    function getPaths(obj) {
      var paths = [];

      function pushPaths(config_obj) {
        for (var k in config_obj) {
          var v = config_obj[k];
          if (v instanceof Object) {
            pushPaths(v);
          } else {
            paths.push(v);
          }
        }
      };

      pushPaths(obj);
      return paths;
    }

    return getPaths(bumblebeeConfig);
  };

  return {
    waitSeconds: 0,
    baseUrl: 'dist/js', // this is needed just for the 'stupid' list task
    release_concatenated: {
      options: {
        baseUrl: 'dist/',
        wrapShim: true,
        include : createIncludePaths(),
        allowSourceOverwrites: true,
        out: 'dist/bumblebee_app.js',
        name: 'js/apps/discovery/main',
        keepBuildDir: true,
        mainConfigFile : 'dist/discovery.config.js',
        findNestedDependencies: true,
        wrap: true,
        preserveLicenseComments: false,
        generateSourceMaps: false,
        stubModules : ['babel', 'es6'],
        optimize: 'none', //'uglify2',
        paths : {
          //use cdns for major libs
          'backbone-validation': 'empty:',
          'backbone.stickit': 'empty:',
          'backbone.wreqr': 'empty:',
          'backbone': 'empty:',
          'bootstrap': 'empty:',
          'bootstrap-notify': 'empty:',
          'classnames': 'empty:',
          'clipboard': 'empty:',
          'create-react-class': 'empty:',
          'd3-cloud': 'empty:',
          'd3': 'empty:',
          'es5-shim': 'empty:',
          'filesaver': 'empty:',
          'google-analytics': 'empty:',
          'google-recaptcha': 'empty:',
          'jquery-ui' : 'empty:',
          'jquery' : 'empty:',
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
          'underscore': 'empty:',
        }
      }
    },
    release_css: {
      options: {
        keepBuildDir: true,
        allowSourceOverwrites: true,
        baseUrl: 'dist/styles/css',
        removeCombined: true,
        dir: 'dist/styles/css',
        optimizeCss: 'standard'
      }
    }
  };
};
