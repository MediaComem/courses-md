const chalk = require('chalk');
const cp = require('child_process');
const debug = require('debug')('courses-md:publish');
const del = require('del');
const fs = require('fs-extra');
const path = require('path');

const build = require('./build');
const { createTemporaryDirectory, execute } = require('./utils');

module.exports = async function publish(config) {

  const branch = config.publish.branch;
  const repoUrl = config.publish.gitUrl;

  const [ currentBranch, scmVersion ] = await Promise.all([
    executeDebugged([ 'git', 'rev-parse', '--abbrev-ref', 'HEAD' ], { cwd: config.absoluteRootDir }),
    config.loadScmVersion()
  ]);

  const tmpDir = await createPublishDirectory();

  const gitCommandOptions = { cwd: tmpDir };

  await executeDebugged([ 'git', 'init' ], gitCommandOptions);
  await executeDebugged([ 'git', 'remote', 'add', '-t', branch, 'origin', repoUrl ], gitCommandOptions);
  await executeDebugged([ 'git', 'fetch', 'origin' ], gitCommandOptions);
  await executeDebugged([ 'git', 'checkout', branch ], gitCommandOptions);

  const buildDir = path.join(tmpDir, config.publish.version);
  await del(buildDir, { force: true });

  config.build = buildDir;
  config.publishing = true;

  const previousPublishBaseUrl = config.publish.baseUrl;
  config.publish.baseUrl = `${config.effectiveBaseUrl}${config.publish.version}/`

  await build(config);

  const latestDir = path.join(tmpDir, 'latest');
  await del(latestDir, { force: true });
  await fs.copy(buildDir, latestDir);

  if (config.publish.afterBuild) {
    await config.publish.afterBuild(config, tmpDir);
  }

  config.publish.baseUrl = previousPublishBaseUrl;

  await executeDebugged([ 'git', 'add', '--all', '.' ], gitCommandOptions);

  const status = await executeDebugged([ 'git', 'status', '--porcelain' ], gitCommandOptions);
  if (!status.trim().length) {
    console.log('No changes');
    return;
  }

  await executeDebugged([ 'git', 'commit', '-m', `Generated content from ${currentBranch}@${scmVersion}` ], gitCommandOptions);
  await executeDebugged([ 'git', 'push' ], gitCommandOptions);
};

function createPublishDirectory() {

  const options = {
    prefix: 'courses-md-',
    unsafeCleanup: true
  };

  return createTemporaryDirectory(options);
}

function executeDebugged(...args) {
  debug(chalk.cyan(args[0].join(' ')));
  return execute(...args);
}
