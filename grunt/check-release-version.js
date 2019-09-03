'use strict';
/**
 * Options for the `check-release-version` grunt task
 *
 * @module grunt/check-release-version
 */
module.exports = function (grunt) {
  grunt.registerMultiTask('check-release-version', 'Get release version', async function () {
    const done = this.async();
    const axios = require('axios');
    const fs = require('fs');
    const gitVersionFileName = '.git-current-version';
    const githubReleasesPath = 'https://api.github.com/repos/adsabs/bumblebee/releases/latest';
    const releaseFilePath = '/release';

    try {
      let version;

      if (fs.existsSync(releaseFilePath)) {

        // check for the existence of release file
        console.log('found release file!');
        const buffer = fs.readFileSync(releaseFilePath);
        version = buffer.toString();
      } else {

        // otherwise, get the latest version from github
        console.log('did not find release file, fetching latest release from github');
        const response = await axios.get(githubReleasesPath);
        version = response.data.tag_name;
      }

      if (version) {
        console.log('version found: ', version);
        grunt.file.write(gitVersionFileName, version);
      }
    } catch (e) {
      console.error(e);
    } finally {
      done();
    }
  });

  return {
    release: {
      options: {}
    }
  }
};
