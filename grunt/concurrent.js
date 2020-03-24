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
    'curl:react-prop-types',
    'curl:react-redux',
  ],
  hash_require: ['hash_require:js', 'hash_require:css'],
};
