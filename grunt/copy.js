/**
 * Options for the `copy` grunt task
 *
 * @module grunt/copy
 */
module.exports = function(grunt) {
  return {
    libs: {
      files: [
        // requirejs
        {
          src: 'node_modules/requirejs/require.js',
          dest: 'src/libs/require.js',
        },

        // react-bootstrap
        {
          src: 'node_modules/react-bootstrap/dist/react-bootstrap.min.js',
          dest: 'src/libs/react-bootstrap.js',
        },

        // react-aria-menubutton
        {
          src: 'node_modules/react-aria-menubutton/umd/ReactAriaMenuButton.js',
          dest: 'src/libs/react-aria-menubutton.js',
        },

        // @hookform/resolvers
        {
          src:
            'node_modules/@hookform/resolvers/dist/index.umd.production.min.js',
          dest: 'src/libs/hookform.js',
        },

        // regenerator-runtime
        {
          src: 'node_modules/regenerator-runtime/runtime.js',
          dest: 'src/libs/regenerator-runtime.js',
        },

        // react-async
        {
          src: 'node_modules/react-async/dist-umd/index.js',
          dest: 'src/libs/react-async.js',
        },

        // react-window
        {
          src: 'node_modules/react-window/dist/index-prod.umd.js',
          dest: 'src/libs/react-window.js',
        },

        // react-transition-group
        {
          src:
            'node_modules/react-transition-group/dist/react-transition-group.min.js',
          dest: 'src/libs/react-transition-group.js',
        },

        // react-data-table
        {
          src:
            'node_modules/react-data-table-component/dist/react-data-table-component.umd.js',
          dest: 'src/libs/react-data-table-component.js',
        },

        // react-is
        {
          src: 'node_modules/react-is/umd/react-is.production.min.js',
          dest: 'src/libs/react-is.js',
        },

        // styled-components
        {
          src: 'node_modules/styled-components/dist/styled-components.min.js',
          dest: 'src/libs/styled-components.js',
        },

        // react-hook-form
        {
          src: 'node_modules/react-hook-form/dist/index.umd.production.min.js',
          dest: 'src/libs/react-hook-form.js',
        },

        // moment
        {
          src: 'node_modules/moment/min/moment.min.js',
          dest: 'src/libs/moment.js',
        },

        // backbone
        {
          src: 'node_modules/backbone/backbone-min.js',
          dest: 'src/libs/backbone.js',
        },

        // backbone-validation
        {
          src:
            'node_modules/backbone-validation/dist/backbone-validation-amd-min.js',
          dest: 'src/libs/backbone-validation.js',
        },

        // backbone.stickit
        {
          src: 'node_modules/backbone.stickit/backbone.stickit.js',
          dest: 'src/libs/backbone.stickit.js',
        },

        // backbone.wreqr
        {
          src: 'node_modules/backbone.wreqr/lib/backbone.wreqr.min.js',
          dest: 'src/libs/backbone.wreqr.js',
        },

        // backbone.marionette
        {
          src:
            'node_modules/backbone.marionette/lib/backbone.marionette.min.js',
          dest: 'src/libs/backbone.marionette.js',
        },

        // hotkeys-js
        {
          src: 'node_modules/hotkeys-js/dist/hotkeys.min.js',
          dest: 'src/libs/hotkeys.js',
        },

        // file-saver
        {
          src: 'node_modules/file-saver/FileSaver.min.js',
          dest: 'src/libs/file-saver.js',
        },

        // prop-types
        {
          src: 'node_modules/prop-types/prop-types.min.js',
          dest: 'src/libs/prop-types.js',
        },

        // d3
        {
          src: 'node_modules/d3/d3.min.js',
          dest: 'src/libs/d3.js',
        },
        // d3-cloud
        {
          src: 'node_modules/d3-cloud/build/d3.layout.cloud.js',
          dest: 'src/libs/d3-cloud.js',
        },

        // fontawesome
        {
          cwd: 'node_modules/font-awesome',
          src: ['scss/*', 'fonts/*'],
          dest: 'src/libs/fontawesome/',
          expand: true,
        },

        // clipboard
        {
          src: 'node_modules/clipboard/dist/clipboard.min.js',
          dest: 'src/libs/clipboard.js',
        },

        // bootstrap sass (scss and js)
        {
          cwd: 'node_modules/bootstrap-sass/assets',
          src: ['stylesheets/**/*', 'javascripts/bootstrap.min.js'],
          expand: true,
          dest: 'src/libs/bootstrap/',
          rename: function(dest, src) {
            return dest + src.replace('javascripts/bootstrap.min', 'bootstrap');
          },
        },

        // redux
        {
          src: 'node_modules/redux/dist/redux.min.js',
          dest: 'src/libs/redux.js',
        },

        // redux-thunk
        {
          src: 'node_modules/redux-thunk/dist/redux-thunk.min.js',
          dest: 'src/libs/redux-thunk.js',
        },

        // jquery
        {
          src: 'node_modules/jquery/dist/jquery.min.js',
          dest: 'src/libs/jquery.js',
        },

        // mathjax
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
            return dest + src.replace('MathJax.js', 'mathjax.js');
          },
        },

        // persist-js
        {
          src: 'node_modules/persist-js/persist-min.js',
          dest: 'src/libs/persist-js.js',
        },

        // bowser
        {
          src: 'node_modules/bowser/es5.js',
          dest: 'src/libs/bowser.js',
        },

        // jsonpath
        {
          src: 'node_modules/jsonpath/jsonpath.min.js',
          dest: 'src/libs/jsonpath.js',
        },

        // lodash
        {
          src: 'node_modules/lodash/dist/lodash.compat.min.js',
          dest: 'src/libs/lodash.js',
        },

        // select2
        {
          cwd: 'node_modules/select2/dist/',
          src: ['**/select2.min.{js,css}'],
          expand: true,
          dest: 'src/libs/select2/',
          rename: function(dest, src) {
            return dest + src.replace(/(css|js)\/select2.min/g, 'select2');
          },
        },

        // select2 matcher
        {
          src: 'node_modules/select2/src/js/select2/compat/matcher.js',
          dest: 'src/libs/select2/matcher.js',
        },

        // babel (standalone)
        {
          src: 'node_modules/@babel/standalone/babel.min.js',
          dest: 'src/libs/babel.js',
        },

        // requirejs-hbs
        {
          cwd: 'node_modules/require-handlebars-plugin',
          src: ['hbs.js', 'hbs/**/*'],
          dest: 'src/libs/requirejs-plugins/',
          expand: true,
        },

        // requirejs-es6
        {
          src: 'node_modules/requirejs-babel-plugin/es6.js',
          dest: 'src/libs/requirejs-plugins/es6.js',
        },

        // requirejs-async
        {
          src: 'node_modules/requirejs-async/async.js',
          dest: 'src/libs/requirejs-plugins/async.js',
        },

        // sprintf-js
        {
          src: 'node_modules/sprintf-js/dist/sprintf.min.js',
          dest: 'src/libs/sprintf.js',
        },

        // diff
        {
          src: 'node_modules/diff/dist/diff.min.js',
          dest: 'src/libs/diff.js',
        },

        // react
        {
          src: 'node_modules/react/umd/react.production.min.js',
          dest: 'src/libs/react.js',
        },

        // react-dom
        {
          src: 'node_modules/react-dom/umd/react-dom.production.min.js',
          dest: 'src/libs/react-dom.js',
        },

        // react-redux
        {
          src: 'node_modules/react-redux/dist/react-redux.min.js',
          dest: 'src/libs/react-redux.js',
        },

        // mocha
        {
          cwd: 'node_modules/mocha',
          src: ['mocha.js', 'mocha.css'],
          dest: 'src/libs/mocha/',
          expand: true,
        },

        // sinon
        {
          src: 'node_modules/sinon/pkg/sinon.js',
          dest: 'src/libs/sinon.js',
        },

        // chai
        {
          src: 'node_modules/chai/chai.js',
          dest: 'src/libs/chai.js',
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
            '!./styles/favicon/**',
          ],
          dest: 'dist/',
        },
        {
          expand: true,
          cwd: 'src',
          src: ['./styles/favicon/**'],
          dest: 'dist/',
          flatten: true,
        },
      ],
    },

    discovery_vars: {
      src: 'src/config/discovery.vars.js.default',
      dest: 'src/config/discovery.vars.js',
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
