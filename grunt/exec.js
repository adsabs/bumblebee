'use strict';
/**
 * Options for the `exec` grunt task
 *
 * @module grunt/exec
 */
module.exports = {
  // this is necessary to make the library AMD compatible
  install_dsjslib_cache: {
    cmd:
      'mkdir -p src/libs/cache && wget -q -O src/libs/cache/index.js https://gitcdn.xyz/repo/thostetler/dsjslib/master/cache.js',
  },
  convert_requirejs: {
    cmd:
      'node_modules/.bin/uglifyjs src/libs/requirejs/require.js -c -m -o src/libs/requirejs/require.js',
  },
  latest_commit: {
    cmd: 'git rev-parse --short=7 --verify HEAD | cat > git-latest-commit',
  },
  latest_tag: {
    cmd: 'git describe --abbrev=0 | cat > git-latest-release-tag',
  },
  git_current_tag: {
    cmd: 'git describe --tags --abbrev=0 > .tag',
  },
  npm_install: {
    cmd: 'npm install --no-package-lock --no-shrinkwrap',
  },
  install_enzyme: {
    cmd:
      'mkdir -p src/libs/enzyme && wget -q -O src/libs/enzyme/index.js https://gitcdn.link/repo/thostetler/enzyme/7c39296c83ed3a8fc09907c9d013aee8d91bde5e/enzyme.2.7.1.js',
  },
  'nyc-instrument': {
    cmd: 'node_modules/.bin/nyc instrument dist/js/ test/coverage/instrument',
  },
  'coveralls-report': {
    cmd:
      'cat test/coverage/reports/lcov/lcov.info | ./node_modules/coveralls/bin/coveralls.js',
  },
  server: 'node server',
};
