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
  ],
  hash_require: ['hash_require:js', 'hash_require:css'],
};
