const chalk = require('chalk');
const debug = require('debug')('courses-md:build:main-bundle');
const path = require('path');
const prettyBytes = require('pretty-bytes');

const { runWebpack } = require('../utils');
const webpackBuildConfig = require('./webpack.build');

module.exports = async function buildMainBundle(config) {

  const entryPointPath = config.absoluteEntryPointFile;
  const bundlePath = config.mainBundlePath;

  const stats = await runWebpack(webpackBuildConfig(entryPointPath, bundlePath));

  stats.assets.forEach(asset => {
    debug(`${chalk.green(path.join(config.absoluteBuildDir, asset.name))} ${chalk.magenta(prettyBytes(asset.size))}`)
  });

  return {
    entryPointPath: entryPointPath,
    bundlePath: bundlePath
  };
}
