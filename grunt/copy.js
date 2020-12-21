'use strict';
/**
 * Options for the `copy` grunt task
 *
 * @module grunt/copy
 */
module.exports = function(grunt) {
  return {
    libs: {
      files: [
        {
          cwd: 'node_modules/xstate/dist',
          src: 'xstate.js',
          dest: 'src/libs/xstate/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('xstate.js', 'index.js');
          },
        },
        {
          cwd: 'node_modules/react-bootstrap/dist',
          src: 'react-bootstrap.min.js',
          dest: 'src/libs/react-bootstrap/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('react-bootstrap.min.js', 'index.js');
          },
        },
        {
          cwd: 'node_modules/recoil/umd',
          src: 'recoil.min.js',
          dest: 'src/libs/recoil/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('recoil.min.js', 'index.js');
          },
        },
        {
          cwd: 'node_modules/@hookform/resolvers/dist',
          src: 'index.umd.production.min.js',
          dest: 'src/libs/@hookform/',
          expand: true,
          rename: function(dest, src) {
            return (
              dest + src.replace('index.umd.production.min.js', 'index.js')
            );
          },
        },
        {
          cwd: 'node_modules/regenerator-runtime',
          src: 'runtime.js',
          dest: 'src/libs/regenerator-runtime/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('runtime.js', 'index.js');
          },
        },
        {
          cwd: 'node_modules/react-async/dist-umd',
          src: 'index.js',
          dest: 'src/libs/react-async/',
          expand: true,
        },
        {
          cwd: 'node_modules/react-window/dist',
          src: 'index-prod.umd.js',
          dest: 'src/libs/react-window/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('index-prod.umd', 'index');
          },
        },
        {
          cwd: 'node_modules/react-data-table-component/dist',
          src: 'react-data-table-component.umd.js',
          dest: 'src/libs/react-data-table-component/',
          expand: true,
          rename: function(dest, src) {
            return (
              dest + src.replace('react-data-table-component.umd', 'index')
            );
          },
        },
        {
          cwd: 'node_modules/react-is/umd',
          src: 'react-is.production.min.js',
          dest: 'src/libs/react-is/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('react-is.production.min', 'index');
          },
        },
        {
          cwd: 'node_modules/styled-components/dist',
          src: 'styled-components.min.js',
          dest: 'src/libs/styled-components/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('styled-components.min', 'index');
          },
        },
        {
          cwd: 'node_modules/react-hook-form/dist/',
          src: 'index.umd.production.min.js',
          dest: 'src/libs/react-hook-form/',
          expand: true,
          rename: function(dest, src) {
            return (
              dest + src.replace('index.umd.production.min.js', 'index.js')
            );
          },
        },
        {
          cwd: 'node_modules/hotkeys-js/dist',
          src: 'hotkeys.min.js',
          dest: 'src/libs/hotkeys/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('hotkeys.min', 'index');
          },
        },
        {
          cwd: 'node_modules/file-saver/dist',
          src: 'FileSaver.js',
          dest: 'src/libs/file-saver/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('FileSaver', 'index');
          },
        },
        {
          cwd: 'node_modules/file-saver',
          src: 'FileSaver.js',
          dest: 'src/libs/file-saver/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('FileSaver', 'index');
          },
        },
        {
          src: 'bower_components/lodash/dist/*',
          dest: 'src/libs/lodash/',
          expand: true,
          flatten: true,
        },
        {
          src: 'bower_components/marionette/lib/*',
          dest: 'src/libs/marionette/',
          expand: true,
          flatten: true,
        },
        {
          src: 'bower_components/backbone.babysitter/lib/*',
          dest: 'src/libs/backbone.babysitter/',
          expand: true,
          flatten: true,
        },
        {
          src: [
            'bower_components/bootstrap/dist/css/*',
            'bower_components/bootstrap/dist/fonts/*',
            'bower_components/bootstrap/dist/js/*',
          ],
          dest: 'src/libs/bootstrap/',
          expand: true,
          flatten: true,
        },
        {
          src: ['bower_components/d3/*.js'],
          dest: 'src/libs/d3/',
          expand: true,
          flatten: true,
        },
        {
          src: ['bower_components/requirejs-plugins/src/*.js'],
          dest: 'src/libs/requirejs-plugins/',
          expand: true,
          flatten: true,
        },

        {
          src: ['bower_components/fontawesome/scss/*'],
          dest: 'src/libs/fontawesome/scss/',
          expand: true,
          flatten: true,
        },
        {
          src: ['bower_components/fontawesome/fonts/*'],
          dest: 'src/libs/fontawesome/fonts',
          expand: true,
          flatten: true,
        },
        {
          cwd: 'bower_components/bootstrap-sass/assets/stylesheets/',
          src: '**',
          expand: true,
          dest: 'src/libs/bootstrap-sass',
        },
        {
          src: ['bower_components/requirejs-babel/*.js'],
          dest: 'src/libs/requirejs-babel-plugin/',
          expand: true,
          flatten: true,
        },
        {
          cwd: 'node_modules/redux/dist',
          src: 'redux.min.js',
          dest: 'src/libs/redux/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('redux.min', 'index');
          },
        },
        {
          cwd: 'node_modules/redux-thunk/dist',
          src: 'redux-thunk.min.js',
          dest: 'src/libs/redux-thunk/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('redux-thunk.min', 'index');
          },
        },
        {
          cwd: 'node_modules/mathjax/',
          src: [
            'MathJax.js',
            'extensions/**/*',
            'config/**/*',
            'fonts/**/*',
            'jax/**/*',
          ],
          dest: 'src/libs/mathjax/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('MathJax.js', 'index.js');
          },
        },
        {
          src: [
            'bower_components/select2/**/*.js',
            'bower_components/select2/**/*.css',
          ],
          dest: 'src/libs/select2/',
          expand: true,
          flatten: true,
        },
        {
          cwd: 'node_modules/jsonpath',
          src: 'jsonpath*.js',
          dest: 'src/libs/jsonpath',
          expand: true,
        },
      ],
    },

    release: {
      files: [
        {
          expand: true,
          cwd: 'src',
          src: [
            './config/**',
            './js/**',
            './libs/**',
            './styles/**',
            './*.html',
            './shared/dist/**',
          ],
          dest: 'dist/',
        },
      ],
    },

    discovery_vars: {
      src: 'src/discovery.vars.js.default',
      dest: 'src/discovery.vars.js',
      filter: function() {
        // Only copy if over if it does not exist
        var dest = grunt.task.current.data.dest;
        return !grunt.file.exists(dest);
      },
    },

    keep_original: {
      files: [
        {
          expand: true,
          src: ['./dist/index.html', 'dist/config/discovery.config.js'],
          dest: 'dist/',
          rename: function(dest, src) {
            var x = src.split('.');
            return (
              x.slice(0, x.length - 1).join('.') +
              '.original.' +
              x[x.length - 1]
            );
          },
        },
      ],
    },

    foo: {
      files: [
        {
          src: ['./src/js/components/**/*.js'],
          dest: 'dist/',
          expand: true,
          rename: function(dest, src) {
            return dest + src.replace('/src/', '/');
          },
        },
      ],
    },

    //give the concatenated file a cache busting hash
    bumblebee_app: {
      files: [
        {
          src: ['dist/bumblebee_app.js'],
          dest: 'dist/',
          expand: true,
          rename: function(dest, src) {
            var gitDescribe = grunt.file.read('git-describe').trim();
            // find out what version of bbb we are going to assemble
            var tagInfo = gitDescribe.split('-');
            var version;
            if (tagInfo.length == 1) {
              version = tagInfo[0]; // the latest tag is also the latest commit (we'll use tagname v1.x.x)
            } else {
              version = tagInfo[2]; // use commit number instead of a tag
            }
            return 'dist/bumblebee_app.' + version + '.js';
          },
        },
      ],
    },
  };
};
