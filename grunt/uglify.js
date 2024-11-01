/**
 * Options for the `uglify` grunt task
 *
 * @module grunt/uglify
 */
module.exports = {
  release: {
    options: {
      sourceMap: true,
      mangle: true,
      compress: {
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
      },
      output: {
        comments: false,
      },
    },
    files: [
      {
        expand: true,
        cwd: 'dist',
        src: [
          'config/*.js',
          'js/**/*.js',
          'libs/d3-cloud.js',
          'libs/react-async.js',
          'libs/react-flexview.js',
          'libs/cache.js',
          'libs/backbone.stickit.js',
          'libs/yup.js',
        ],
        dest: 'dist',
      },
    ],
  },
};
