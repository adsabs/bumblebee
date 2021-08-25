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
    cwd: 'dist/js',
    cmd:
      '../../node_modules/.bin/nyc instrument . ../../test/coverage/instrument',
  },
  server: 'node server',
  suit_build: {
    cwd: './src/shared',
    cmd: 'sh ./install.sh',
  },
  submodule_init: {
    cmd: 'git submodule update --init',
  },
  sass: {
    cmd:
      './node_modules/.bin/sass --no-source-map src/styles/sass/manifest.scss src/styles/css/styles.css',
  },
};
