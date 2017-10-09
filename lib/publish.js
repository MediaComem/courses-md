const cp = require('child_process');
const del = require('del');
const fs = require('fs-extra');
const path = require('path');

const build = require('./build');
const { createTemporaryDirectory, execute } = require('./utils');

module.exports = async function publish(config) {

  const branch = config.publish.branch;
  const repoUrl = config.publish.url;

  const [ currentBranch, scmVersion ] = await Promise.all([
    execute([ 'git', 'rev-parse', '--abbrev-ref', 'HEAD' ], { cwd: config.absoluteRootDir }),
    config.loadScmVersion()
  ]);

  const tmpDir = await createPublishDirectory();

  const gitCommandOptions = { cwd: tmpDir };

  await execute([ 'git', 'init' ], gitCommandOptions);
  await execute([ 'git', 'remote', 'add', '-t', branch, 'origin', repoUrl ], gitCommandOptions);
  await execute([ 'git', 'fetch', 'origin' ], gitCommandOptions);
  await execute([ 'git', 'checkout', branch ], gitCommandOptions);

  const buildDir = path.join(tmpDir, config.publish.version);
  await del(buildDir, { force: true });

  config.build = buildDir;

  await build(config);

  const latestDir = path.join(tmpDir, 'latest');
  await del(latestDir, { force: true });
  await fs.copy(buildDir, latestDir);

  if (config.publish.afterBuild) {
    await config.publish.afterBuild(config, tmpDir);
  }

  await execute([ 'git', 'add', '--all', '.' ], gitCommandOptions);
  await execute([ 'git', 'commit', '-m', `Generated content from ${currentBranch}@${scmVersion}` ], gitCommandOptions);
  await execute([ 'git', 'push' ], gitCommandOptions);
};

function createPublishDirectory() {

  const options = {
    prefix: 'courses-md-',
    unsafeCleanup: true
  };

  return createTemporaryDirectory(options);
}
