'use strict';
/**
 * Options for the `concurrent` grunt task
 *
 * @module grunt/concurrent
 */
module.exports = {
  fetch_deps: {
    options: {
      indent: false,
    },
    tasks: [
      'curl:google-analytics',
      'curl:enzyme',
      'curl:dsjslib-cache',
      // 'curl:react-transition-group',
      'curl:yup',
      'curl:react-flexview',
      'curl:array-flat-polyfill',
      'curl:polyfill',
      'curl:chai',
      'curl:mocha',
      'curl:sinon',
      'curl:jqueryui',
    ],
  },
  hash_require: ['hash_require:js', 'hash_require:css'],
};
