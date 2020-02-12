'use strict';
/**
 * Options for the `prettier` grunt task
 *
 * @module grunt/prettier
 */
module.exports = {
  options: {},
  files: {
    src: [
      'src/js/**/*.js',
      'src/js/**/*.html',
      'src/*.html',
      'src/config/*.js',
    ],
  },
};
