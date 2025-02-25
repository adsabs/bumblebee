/* eslint-disable global-require */
module.exports = function(grunt) {
  require('time-grunt')(grunt);
  require('load-grunt-config')(grunt, {
    data: {
      pkg: grunt.file.readJSON('package.json'),
      local: grunt.file.exists('local-config.json')
        ? grunt.file.readJSON('local-config.json')
        : {},
    },
    jitGrunt: {
      staticMappings: {
        express: 'grunt-express-server',
        uglify: 'grunt-contrib-uglify',
      },
    },
  });
};
