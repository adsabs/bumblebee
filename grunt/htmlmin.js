/**
 * Options for the `htmlmin` grunt task
 *
 * @module grunt/htmlmin
 */
module.exports = {
  options: {
    removeComments: true,
    collapseWhitespace: true,
  },
  release: {
    files: [
      {
        expand: true,
        cwd: 'dist',
        src: ['*.html'],
        dest: 'dist',
      },
    ],
  },
};
