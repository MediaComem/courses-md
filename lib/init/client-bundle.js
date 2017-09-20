const fs = require('fs-extra');
const path = require('path');

const { runWebpack } = require('../utils');
const clientWebpackConfig = require('./webpack.client');

module.exports = async function initClientBundle(config) {

  const clientBundlePath = config.clientBundlePath;
  if (await fs.pathExists(clientBundlePath)) {
    return {
      clientBundlePath: clientBundlePath,
      saved: false
    };
  }

  const entryPointSourcePath = path.join(__dirname, '..', 'client', 'index.js');
  await runWebpack(clientWebpackConfig(entryPointSourcePath, clientBundlePath));

  return {
    clientBundlePath: clientBundlePath,
    saved: true
  };
}
