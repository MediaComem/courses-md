const chalk = require('chalk');
const fs = require('fs-extra');
const ora = require('ora');
const path = require('path');
const request = require('request-promise');

const clientWebpackConfig = require('../client/webpack.client');
const { getTemplate } = require('../templates');
const { runWebpack } = require('../utils');

module.exports = init;

async function init(config) {
  await Promise.all([
    buildClient(config),
    initSrcDir(config)
  ]);
}

async function buildClient(config) {

  const targetPath = path.join(config.vendorDir, 'courses-md.js');
  if (fs.existsSync(targetPath)) {
    ora(`${chalk.magenta(targetPath)} already exists`).info();
    return;
  }

  const entryPointPath = path.join(__dirname, '..', 'client', 'index.js');
  await runWebpack(clientWebpackConfig(entryPointPath)).then(stats => {
    ora(`Compiled courses-md client to ${chalk.magenta(targetPath)}`).succeed();
  });
}

async function initSrcDir(config) {

  const indexPath = path.join(config.srcDir, 'index.js');
  if (fs.existsSync(indexPath)) {
    ora(`${chalk.magenta(indexPath)} already exists`).info();
  } else {

    await fs.mkdirsAsync(config.srcDir);

    const templateFunc = await getTemplate('index.js');

    const vendorBundlePath = path.join(config.vendorDir, 'courses-md.js');
    const relativeEntryPointPath = path.relative(path.dirname(indexPath), vendorBundlePath);

    const contents = templateFunc({
      libPath: relativeEntryPointPath
    });

    await fs.writeFileSync(indexPath, contents, { encoding: 'utf8' });
    ora(`Created ${chalk.magenta(indexPath)}`).succeed();
  }
}
