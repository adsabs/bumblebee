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
          '!babel.js',
          '!requirejs-plugins/*.js',
          '!sprintf.js',
          '!sinon.js',
          '!enzyme.js',
          '!mocha.js',
          '!chai.js',
          '!mathjax/**/*.js',
          '!bootstrap/**/*.js',
          '!fontawesome/**/*.js',
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
  instrument: {
    files: [
      {
        expand: true,
        cwd: 'dist/js',
        src: '**/*.js',
        dest: 'test/coverage/instrument',
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
