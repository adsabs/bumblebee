'use strict';
/**
 * Options for the `concurrent` grunt task
 *
 * @module grunt/concurrent
 */
module.exports = {
  install: [
    'bower:install',
    'curl:google-analytics',
    'curl:enzyme',
    'curl:dsjslib-cache',
    'curl:react-transition-group',
    'curl:react',
    'curl:react-bootstrap',
    'curl:react-dom',
    'curl:prop-types',
    'curl:react-redux',
    'curl:yup',
    'curl:react-flexview',
    'curl:deep-object-diff',
    'curl:xstate-react',
    'curl:array-flat-polyfill',
    'curl:sinon',
    'curl:polyfill',
  ],
  hash_require: ['hash_require:js', 'hash_require:css'],
};
