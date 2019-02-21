'use strict';
/**
 * Options for the `sw-precache` grunt task
 *
 * For generating the service worker and initializing the pre-cache
 *
 * @module grunt/sw-precache
 */
module.exports = {
  options: {
    baseDir: 'dist',
    cacheId: 'bumblebee',
    workerFileName: 'sw.js',
    verbose: true
  },
  generate: {
    staticFileGlobs: [
      '*.{js,html}',
      'js/**/*.{js,html}',
      'styles/css/**/*',
      'styles/img/*'
    ]
  }
};
