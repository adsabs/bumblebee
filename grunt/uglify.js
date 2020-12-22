'use strict';
/**
 * Options for the `uglify` grunt task
 *
 * @module grunt/uglify
 */
module.exports = {
  release: {
    options: {
      mangle: true,
      compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      },
    },
    files: [
      {
        expand: true,
        cwd: 'dist',
        src: [
          'config/*.js',
          'js/**/*.js',
          'libs/**/*.js',
          '!libs/jasmine/**/*',
          '!libs/enzyme/**/*',
          '!libs/mathjax/**/*',
          '!libs/select2/**/*',
          '!libs/sinon/**/*',
          '!libs/require-handlebars-plugin/**/*',
          '!libs/requirejs-babel-plugin/**/*',
          '!libs/requirejs/**/*',
          '!libs/requirejs-plugins/**/*',
        ],
        dest: 'dist',
      },
    ],
  },
};
