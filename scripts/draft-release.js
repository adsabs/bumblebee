const { promisify } = require('util');
const semver = require('semver');
const exec = promisify(require('child_process').exec);
let incType = process.argv[2];

(async () => {
  const { stdout: currVersion } = await exec(
    'git describe --tags $(git rev-list --tags --max-count=1)'
  );
  const cleanVersion = currVersion.replace('\n', '');

  const { stdout: prList } = await exec(
    `git log --merges --grep 'Merge pull request' --pretty=format:'%s$$%b' ${cleanVersion}..`
  );

  if (prList === '') {
    console.log(`No merged pull requests found since release ${currVersion}`);
    process.exit(0);
  }

  const list = prList
    .split(/[\n\r]/)
    .map((l) => l.split('$$'))
    .map(([a, b]) => `${/(#[0-9]+)/.exec(a)[1]} - ${b}`);

  console.log('creating release draft');
  if (!['major', 'minor', 'patch'].includes(incType)) {
    incType = 'patch';
  }

  const newVersion = semver.inc(cleanVersion, incType);
  console.log(`version moving from ${cleanVersion} to ${newVersion}`);

  const message = `v${newVersion}\n\n${list.join('\n')}`;

  const { stdout: tagURL } = await exec(
    `hub release create -d -m "${message}" v${newVersion}`
  );

  console.log(`draft created!`);
  console.log(tagURL);
})();
