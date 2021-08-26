/* eslint-disable global-require */
/**
 * creating coverage task
 *
 * @module grunt/coverage
 */
module.exports = function(grunt) {
  const COVERAGE_HTML_OUTPUT_DIR = 'test/coverage/reports/html';
  const COVERAGE_LCOV_OUTPUT_DIR = 'test/coverage/reports/lcov';
  const COVERAGE_COLLECTION_FILE = 'test/coverage/coverage.json';

  grunt.registerMultiTask('coverage-report', function() {
    const istanbul = require('istanbul');
    const options = this.options({ htmlReport: false });

    // get the coverage object from the collection file generated
    const coverageObject = grunt.file.readJSON(COVERAGE_COLLECTION_FILE);

    /**
     * For some reason, possible configuration? -- the instrumentor adds a base prefix to the paths
     * this breaks when we try to run through them, so this will remove that base from all the coverage paths
     */
    const normalizedCoverageObject = Object.keys(coverageObject).reduce(
      (acc, k) => {
        const newPath = k.replace(/^dist\/js\//g, '');

        return {
          ...acc,
          [newPath]: {
            ...coverageObject[k],
            path: newPath,
          },
        };
      },
      {}
    );
    const collector = new istanbul.Collector();
    collector.add(normalizedCoverageObject);

    // Generate a quick summary to be shown in the output
    const finalCoverage = collector.getFinalCoverage();
    const summary = istanbul.utils.summarizeCoverage(finalCoverage);

    // Output the percentages of the coverage
    grunt.log.ok('Coverage:');
    grunt.log.ok('-  Lines: ' + summary.lines.pct + '%');
    grunt.log.ok('-  Statements: ' + summary.statements.pct + '%');
    grunt.log.ok('-  Functions: ' + summary.functions.pct + '%');
    grunt.log.ok('-  Branches: ' + summary.branches.pct + '%');

    // write reports
    if (options.htmlReport) {
      istanbul.Report.create('html', {
        dir: COVERAGE_HTML_OUTPUT_DIR,
      }).writeReport(collector, true);
    }

    istanbul.Report.create('lcov', {
      dir: COVERAGE_LCOV_OUTPUT_DIR,
    }).writeReport(collector, true);
  });

  return {
    coveralls: {
      htmlReport: false,
    },
    html: {
      htmlReport: true,
    },
  };
};
