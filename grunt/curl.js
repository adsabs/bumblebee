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
  'prop-types': {
    src:
      'https://cdnjs.cloudflare.com/ajax/libs/prop-types/15.7.2/prop-types.min.js',
    dest: 'src/libs/prop-types/index.js',
  },
  'react-redux': {
    src:
      'https://cdnjs.cloudflare.com/ajax/libs/react-redux/7.1.3/react-redux.min.js',
    dest: 'src/libs/react-redux/index.js',
  },
  yup: {
    src:
      'https://raw.githubusercontent.com/thostetler/yup/master/build/index.umd.js',
    dest: 'src/libs/yup/index.js',
  },
  'react-flexview': {
    src:
      'https://raw.githubusercontent.com/thostetler/react-flexview/master/build/index.umd.js',
    dest: 'src/libs/react-flexview/index.js',
  },
  'deep-object-diff': {
    src:
      'https://raw.githubusercontent.com/thostetler/deep-object-diff/master/deep-object-diff.umd.js',
    dest: 'src/libs/deep-object-diff/index.js',
  },
  'xstate-react': {
    src:
      'https://raw.githubusercontent.com/thostetler/xstate/master/packages/xstate-react/dist/xstate-react.umd.production.min.js',
    dest: 'src/libs/xstate-react/index.js',
  },
  'array-flat-polyfill': {
    src:
      'https://raw.githubusercontent.com/thostetler/array-flat-polyfill/master/index.js',
    dest: 'src/libs/polyfills/array-flat-polyfill.js',
  },
  sinon: {
    src: 'https://cdnjs.cloudflare.com/ajax/libs/sinon.js/1.9.0/sinon.min.js',
    dest: 'src/libs/sinon/index.js',
  },
  polyfill: {
    src: 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver',
    dest: 'src/libs/polyfill/index.js',
  },
};
