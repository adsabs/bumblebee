'use strict';
/**
 * Options for the `imagemin` grunt task
 *
 * @module grunt/imagemin
 */
module.exports = {
  options: {
    optimizationLevel: 5,
  },
  release: {
    files: [
      {
        expand: true,
        cwd: 'dist/styles/',
        src: ['css/images/*.{svg,png,jpg,gif}', 'img/*.{svg,png,jpg,gif}'],
        dest: 'dist/styles/',
      },
    ],
  },
};
