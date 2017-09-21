const fs = require('fs-extra');
const path = require('path');

const { execute } = require('../utils');

module.exports = async function initNpmInstall(config) {

  const nodeModulesPath = path.join(config.absoluteRootDir, 'node_modules');
  if (await fs.pathExists(nodeModulesPath)) {
    return {
      installed: false
    };
  }

  await execute('npm install', { cwd: config.absoluteRootDir });

  return {
    installed: true
  };
};
