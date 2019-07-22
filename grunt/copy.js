'use strict';
/**
 * Options for the `copy` grunt task
 *
 * @module grunt/copy
 */
module.exports = function (grunt) {

  return {
    libs: {
      files: [
        {
          cwd: 'node_modules/react-bootstrap/dist',
          src: 'react-bootstrap.min.js',
          dest: 'src/libs/react-bootstrap/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('react-bootstrap.min', 'index');
          }
        },
        {
          cwd: 'node_modules/file-saver/dist',
          src: 'FileSaver.js',
          dest: 'src/libs/file-saver/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('FileSaver', 'index');
          }
        },
        {
          cwd: 'node_modules/file-saver',
          src: 'FileSaver.js',
          dest: 'src/libs/file-saver/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('FileSaver', 'index');
          }
        },
        {
          src: 'bower_components/lodash/dist/*',
          dest: 'src/libs/lodash/',
          expand: true,
          flatten: true
        },
        {
          src: 'bower_components/marionette/lib/*',
          dest: 'src/libs/marionette/',
          expand: true,
          flatten: true
        },
        {
          src: 'bower_components/backbone.babysitter/lib/*',
          dest: 'src/libs/backbone.babysitter/',
          expand: true,
          flatten: true
        },
        {
          src: [
            'bower_components/bootstrap/dist/css/*',
            'bower_components/bootstrap/dist/fonts/*',
            'bower_components/bootstrap/dist/js/*'
          ],
          dest: 'src/libs/bootstrap/',
          expand: true,
          flatten: true
        },
        {
          src: ['bower_components/d3/*.js'],
          dest: 'src/libs/d3/',
          expand: true,
          flatten: true
        },
        {
          src: ['bower_components/requirejs-plugins/src/*.js'],
          dest: 'src/libs/requirejs-plugins/',
          expand: true,
          flatten: true
        },

        {
          src: ['bower_components/fontawesome/scss/*'],
          dest: 'src/libs/fontawesome/scss/',
          expand: true,
          flatten: true
        },
        {
          src: ['bower_components/fontawesome/fonts/*'],
          dest: 'src/libs/fontawesome/fonts',
          expand: true,
          flatten: true
        },
        {
          cwd: 'bower_components/bootstrap-sass/assets/stylesheets/',
          src: '**',
          expand: true,
          dest: 'src/libs/bootstrap-sass'
        },
        {
          src: ['bower_components/react/*.js'],
          dest: 'src/libs/react/',
          expand: true,
          flatten: true
        },
        {
          src: ['bower_components/requirejs-babel/*.js'],
          dest: 'src/libs/requirejs-babel-plugin/',
          expand: true,
          flatten: true
        },
        {
          cwd: 'node_modules/create-react-class',
          src: 'create-react-class.js',
          dest: 'src/libs/create-react-class/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('create-react-class', 'index');
          }
        },
        {
          cwd: 'node_modules/redux/dist',
          src: 'redux.min.js',
          dest: 'src/libs/redux/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('redux.min', 'index');
          }
        },
        {
          cwd: 'node_modules/react-redux/dist',
          src: 'react-redux.min.js',
          dest: 'src/libs/react-redux/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('react-redux.min', 'index');
          }
        },
        {
          cwd: 'node_modules/redux-thunk/dist',
          src: 'redux-thunk.min.js',
          dest: 'src/libs/redux-thunk/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('redux-thunk.min', 'index');
          }
        },
        {
          cwd: 'node_modules/mathjax/',
          src: [
            'MathJax.js',
            'extensions/**/*',
            'config/**/*',
            'fonts/**/*',
            'jax/**/*'
          ],
          dest: 'src/libs/mathjax/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('MathJax.js', 'index.js');
          }
        },
        {
          cwd: 'node_modules/prop-types',
          src: 'prop-types.js',
          dest: 'src/libs/react-prop-types/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('prop-types', 'index');
          }
        },
        {
          src: ['bower_components/select2/**/*.js', 'bower_components/select2/**/*.css'],
          dest: 'src/libs/select2/',
          expand: true,
          flatten : true
        },
        {
          cwd: 'node_modules/jsonpath',
          src: 'jsonpath*.js',
          dest: 'src/libs/jsonpath',
          expand: true
        },
        {
          cwd: 'node_modules/prop-types',
          src: 'prop-types.js',
          dest: 'src/libs/react-prop-types/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('prop-types', 'index');
          }
        },
        {
          cwd: 'node_modules/reselect/dist',
          src: 'reselect.js',
          dest: 'src/libs/reselect/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('reselect', 'index');
          }
        },
        {
          cwd: 'node_modules/react/dist',
          src: 'react-with-addons.min.js',
          dest: 'src/libs/react/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('react-with-addons.min', 'index');
          }
        },
        {
          cwd: 'node_modules/react-dom/dist',
          src: 'react-dom.min.js',
          dest: 'src/libs/react-dom/',
          expand: true,
          rename: function (dest, src) {
            return dest + src.replace('react-dom.min', 'index');
          }
        }
      ]
    },

    release: {
      files: [{
        expand: true,
        src: [
          './src/**'
        ],
        dest: 'dist/',
        rename: function(dest, src) {
          return dest + src.replace('/src/', '/');
        }
      }]
    },

    discovery_vars: {
      src: 'src/discovery.vars.js.default',
      dest: 'src/discovery.vars.js',
      filter: function () {
        // Only copy if over if it does not exist
        var dest = grunt.task.current.data.dest;
        return !grunt.file.exists(dest);
      }
    },

    keep_original: {
      files: [{
        expand: true,
        src: [
          './dist/index.html',
          'dist/discovery.config.js'
        ],
        dest: 'dist/',
        rename: function(dest, src) {
          var x = src.split('.');
          return x.slice(0, x.length-1).join('.') + '.original.' + x[x.length-1];
        }
      }]
    },

    foo: {
      files: [{
        src: ['./src/js/components/**/*.js'],
        dest: 'dist/',
        expand: true,
        rename: function(dest, src) {
          return dest + src.replace('/src/', '/');
        }
      }]
    },

    //give the concatenated file a cache busting hash
    bumblebee_app : {
      files : [{
        src: ['dist/bumblebee_app.js'],
        dest: 'dist/',
        expand: true,
        rename : function(dest, src){
          var gitDescribe = grunt.file.read('git-describe').trim();
          // find out what version of bbb we are going to assemble
          var tagInfo = gitDescribe.split('-');
          var version;
          if (tagInfo.length == 1) {
            version = tagInfo[0]; // the latest tag is also the latest commit (we'll use tagname v1.x.x)
          }
          else {
            version = tagInfo[2]; // use commit number instead of a tag
          }
          return 'dist/bumblebee_app.' + version + '.js';
        }

      }]
    }
  };
};
