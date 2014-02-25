//
// For all available config options and default values, see:
// https://github.com/karma-runner/karma/blob/stable/lib/config.js#L54
module.exports = function (config) {
  config.set({

// base path, that will be used to resolve files and exclude
    basePath: '../..',

// list of files / patterns to load in the browser
    files: [
      {pattern: 'bower_components/**/*.js', included: false}
      ,
      {pattern: 'src/libs/**/*.js', included: false}
      ,
      {pattern: 'src/js/apps/**/*.js', included: false}
      ,
      {pattern: 'src/js/modules/**/*.js', included: false}
      ,
      {pattern: 'test/**/*.spec.js', included: false}
    ],

// list of files to exclude
    exclude: [
      "src/js/apps/**/main.js",
      "src/js/apps/**/app.js"
    ],

// possible values: 'dots', 'progress', 'junit', 'teamcity'
// CLI --reporters progress
    reporters: ['progress', 'coverage'],

// web server port
// CLI --port 9876
    port: 9876,

// cli runner port
// CLI --runner-port 9100
    runnerPort: 9100,

// enable / disable colors in the output (reporters and logs)
// CLI --colors --no-colors
    colors: true,

// level of logging
// possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
// CLI --log-level debug
    logLevel: config.LOG_INFO,

// enable / disable watching file and executing tests whenever any file changes
// CLI --auto-watch --no-auto-watch
    autoWatch: true,

// Start these browsers, currently available:
// - Chrome
// - ChromeCanary
// - Firefox
// - Opera
// - Safari (only Mac)
// - PhantomJS
// - IE (only Windows)
// CLI --browsers Chrome,Firefox,Safari
    browsers: ['PhantomJS'], //,'chrome_without_security'],

    customLaunchers: {
      chrome_without_security: {
        base: "Chrome",
        flags: "--disable-web-security"
      }
    },

// If browser does not capture in given timeout [ms], kill it
// CLI --capture-timeout 5000
    captureTimeout: 7000,

// Auto run tests on start (when browsers are captured) and exit
// CLI --single-run --no-single-run
    singleRun: true,

// report which specs are slower than 500ms
// CLI --report-slower-than 500
    reportSlowerThan: 500,

// compile coffee scripts
    preprocessors: {
      'src/js/**/**/*.js': 'coverage'
    },

    frameworks: ['requirejs','mocha'],

    plugins: [
      'karma-requirejs',
      'karma-jasmine',
      'karma-mocha',
      'karma-qunit',
      'karma-phantomjs-launcher',
      'karma-chrome-launcher',
      'karma-coverage'
    ],

    coverageReporter: {
      type: 'lcov',
      dir: 'test/coverage'
    }

  });

};
