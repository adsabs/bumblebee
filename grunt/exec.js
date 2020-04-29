'use strict';
/**
 * Options for the `exec` grunt task
 *
 * @module grunt/exec
 */
module.exports = {
  // this is necessary to make the library AMD compatible
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
  'nyc-instrument': {
    cmd: 'node_modules/.bin/nyc instrument dist/js/ test/coverage/instrument',
  },
  'coveralls-report': {
    cmd:
      'cat test/coverage/reports/lcov/lcov.info | ./node_modules/coveralls/bin/coveralls.js',
  },
  server: 'node server',
  suit_build: {
    cwd: './src/shared',
    cmd: 'sh ./install.sh',
  },
  submodule_init: {
    cmd: 'git submodule update --init',
  },
};
