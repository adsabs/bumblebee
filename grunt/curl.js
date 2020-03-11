'use strict';
/**
 * Options for the `curl` grunt task
 *
 * Safari browser (v6) gets broken by Ghostery, the only solution that works
 * is to serve google-analytics locally; this is out of necessity!
 *
 * @module grunt/curl
 */
module.exports = {
  'google-analytics': {
    src: 'http://www.google-analytics.com/analytics.js',
    dest: 'src/libs/g.js',
  },
  'dsjslib-cache': {
    src: 'https://raw.githubusercontent.com/thostetler/dsjslib/master/cache.js',
    dest: 'src/libs/cache/index.js',
  },
  enzyme: {
    src:
      'https://raw.githubusercontent.com/thostetler/enzyme/7c39296c83ed3a8fc09907c9d013aee8d91bde5e/enzyme.2.7.1.js',
    dest: 'src/libs/enzyme/index.js',
  },
  'react-transition-group': {
    src:
      'https://raw.githubusercontent.com/thostetler/react-transition-group/master/react-transition-group.min.js',
    dest: 'src/libs/react-transition-group/index.js',
  },
  react: {
    src: 'https://unpkg.com/react@16/umd/react.production.min.js',
    dest: 'src/libs/react/index.js',
  },
  'react-bootstrap': {
    src: 'https://unpkg.com/react@16/umd/react.production.min.js',
    dest: 'src/libs/react/index.js',
  },
  'react-dom': {
    src: 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js',
    dest: 'src/libs/react-dom/index.js',
  },
  'react-prop-types': {
    src:
      'https://cdnjs.cloudflare.com/ajax/libs/prop-types/15.7.2/prop-types.min.js',
    dest: 'src/libs/react-prop-types/index.js',
  },
  'react-redux': {
    src:
      'https://cdnjs.cloudflare.com/ajax/libs/react-redux/7.1.3/react-redux.min.js',
    dest: 'src/libs/react-redux/index.js',
  },
};
