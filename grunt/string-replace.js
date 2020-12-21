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
    files: [
      {
        src: 'dist/index.html',
        dest: 'dist/index.html',
      },
    ],
    options: {
      replacements: [
        {
          pattern: 'data-main="./config/discovery.config"',
          replacement: 'data-main="./bumblebee_app.js"',
        },
      ],
    },
  },
  final: {
    files: {
      'dist/': 'dist/**/*.{js,html}',
    },
    options: {
      replacements: [
        {
          pattern: /es6!/gi,
          replacement: '',
        },
      ],
    },
  },
  production: {
    files: {
      'dist/config/': 'dist/config/*.config.js',
    },
    options: {
      replacements: [
        {
          pattern: /\.development/g,
          replacement: '.production.min',
        },
      ],
    },
  },
  temp: {
    files: {
      '_tmp/': '_tmp/**/*.{js,html}',
    },
    options: {
      replacements: [
        {
          pattern: /es6!/gi,
          replacement: '',
        },
      ],
    },
  },
  latest_version: {
    files: {
      'dist/config/shim.js': 'dist/config/shim.js',
    },
    options: {
      replacements: [
        {
          pattern: 'APP_VERSION=""',
          replacement: 'APP_VERSION="<%= appVersion %>";',
        },
      ],
    },
  },
};
