'use strict';
/**
 * Options for the `concurrent` grunt task
 *
 * @module grunt/concurrent
 */
module.exports = {
  install: ['bower:install', 'exec:npm_install', 'curl:google-analytics'],
  convert: [
    'exec:install_enzyme',
    'exec:convert_dsjslib',
    'exec:convert_requirejs',
  ],
  hash_require: ['hash_require:js', 'hash_require:css'],
};
