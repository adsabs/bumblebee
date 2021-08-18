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
    dest: 'src/libs/cache.js',
  },
  enzyme: {
    src:
      'https://raw.githubusercontent.com/thostetler/enzyme/7c39296c83ed3a8fc09907c9d013aee8d91bde5e/enzyme.2.7.1.js',
    dest: 'src/libs/enzyme.js',
  },
  yup: {
    src:
      'https://raw.githubusercontent.com/thostetler/yup/master/build/index.umd.js',
    dest: 'src/libs/yup.js',
  },
  'react-flexview': {
    src:
      'https://raw.githubusercontent.com/thostetler/react-flexview/master/build/index.umd.js',
    dest: 'src/libs/react-flexview.js',
  },
  'array-flat-polyfill': {
    src:
      'https://raw.githubusercontent.com/thostetler/array-flat-polyfill/master/index.js',
    dest: 'src/libs/array-flat-polyfill.js',
  },
  polyfill: {
    src: 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver',
    dest: 'src/libs/polyfill.js',
  },
  jqueryui: {
    src: 'https://code.jquery.com/ui/1.12.1/jquery-ui.min.js',
    dest: 'src/libs/jquery-ui.js',
  },
};
