'use strict';
/**
 * Options for the `babel` grunt task
 *
 * @module grunt/babel
 */
module.exports = {
  release: {
    files: [
      {
        expand: true,
        cwd: 'dist/js',
        src: '**/*.js',
        dest: 'dist/js',
      },
      {
        expand: true,
        cwd: 'dist/libs',
        src: [
          '**/*.js',
          '!jasmine/**/*',
          '!enzyme/**/*',
          '!mathjax/**/*',
          '!select2/**/*',
          '!sinon/**/*',
          '!require-handlebars-plugin/**/*',
          '!requirejs-babel-plugin/**/*',
          '!requirejs/**/*',
          '!requirejs-plugins/**/*',
          '!es5-shim/**/*',
        ],
        dest: 'dist/libs',
      },
      {
        expand: true,
        cwd: 'dist/config',
        src: '**/*.js',
        dest: 'dist/config',
      },
    ],
  },
  temp: {
    files: [
      {
        expand: true,
        cwd: 'src/js',
        src: '**/*.js',
        dest: '_tmp/js',
      },
    ],
  },
};
