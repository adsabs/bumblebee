/**
 * Options for the `eslint` grunt task
 *
 * @module grunt/eslint
 */
module.exports = function(grunt) {
  return {
    options: {
      failOnError: false,
      fix: grunt.option('fix'),
    },
    files: {
      src: ['src/js/**/*.js', 'src/config/*.js'],
    },
  };
};
