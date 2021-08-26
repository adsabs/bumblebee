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
          '!babel.js',
          '!requirejs-plugins/*.js',
          '!sprintf.js',
          '!sinon.js',
          '!enzyme.js',
          '!mocha.js',
          '!chai.js',
          '!mathjax/**/*.js',
          '!bootstrap/**/*.js',
          '!fontawesome/**/*.js',
        ],
        dest: 'dist',
      },
    ],
  },
};
