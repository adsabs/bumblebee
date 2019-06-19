'use strict';
/**
 * Options for the `rev` grunt task
 *
 * @module grunt/rev
 */
module.exports = {
  options: {
    algorithm: 'md5',
    length: 8
  },
  pre: {
    options: {
      jsonOutputPath: 'dist/rev-pre.json'
    },
    files: [{
        src: [
          'dist/*.js',
          'dist/js/**/*.js',
          'dist/styles/css/styles.css',
          '!dist/sw.js',
          '!dist/discovery.vars.js'
        ]
      }
    ]
  },
  bundles: {
    options: {
      jsonOutputPath: 'dist/rev-bundles.json'
    },
    files: [{
      src: [
        'dist/*-page.bundle.js',
      ]
    }
  ]
  },
  post: {
    options: {
      jsonOutputPath: 'dist/rev-post.json'
    },
    files: [{
        src: [
          'dist/*-page.config.js',
        ]
      }
    ]
  }
};
