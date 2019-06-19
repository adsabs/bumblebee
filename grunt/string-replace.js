'use strict';
/**
 * Options for the `string-replace` grunt task
 *
 * For changing the name of the data-main file in dist/index
 *
 * @module grunt/string-replace
 */
module.exports = {
  dist: {
    files: [{
      src: 'dist/index.html',
      dest: 'dist/index.html'
    }],
    options: {
      replacements: [{
        pattern: 'data-main="./discovery.config"',
        replacement: 'data-main="./bumblebee_app.js"'
      }]
    }
  },
  es6: {
    files: {
      'dist/': 'dist/**/*.{js,html}'
    },
    options: {
      replacements: [{
        pattern: /es6!/ig,
        replacement: ''
      }]
    }
  },
  temp: {
    files: {
      '_tmp/': '_tmp/**/*.{js,html}'
    },
    options: {
      replacements: [{
        pattern: /es6!/ig,
        replacement: ''
      }]
    }
  }
};
