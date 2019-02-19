'use strict';
/**
 * Options for the `hash_require` grunt task
 *
 * Add md5 checksums to the distribution files
 *
 * @module grunt/hash_require
 */
module.exports = {
  js: {
    options: {
      mapping: 'dist/jsmap.json',
      destBasePath: 'dist/',
      srcBasePath: 'dist/',
      flatten: false,
      clean: true,
      prepend: true
    },
    src: [
      'dist/*.js',
      'dist/js/**/*.{js,html}',
      '!dist/discovery.config.js'
    ]
  },
  css: {
    options: {
      mapping: 'dist/cssmap.json',
      destBasePath: 'dist/',
      srcBasePath: 'dist/',
      flatten:false
    },
    src: ['dist/styles/css/styles.css']
  }
};
