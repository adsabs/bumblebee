'use strict';
/**
 * Options for the `cssmin` grunt task
 *
 * @module grunt/cssmin
 */
module.exports = {
  'release': {
    files: [{
      expand: true,
      cwd: 'dist/styles/css',
      src: ['*.css']
    }]
  }
};
