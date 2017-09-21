const fs = require('fs-extra');
const path = require('path');

const { getTemplate } = require('../templates');

module.exports = async function initConfig(config) {

  const configPath = path.join(config.absoluteRootDir, 'config.js');
  if (await fs.pathExists(configPath)) {
    return {
      configPath: configPath,
      saved: false
    };
  }

  await fs.mkdirs(path.dirname(configPath));

  const templateFunc = await getTemplate('config.js');

  const configContents = templateFunc({});

  await fs.writeFile(configPath, configContents, { encoding: 'utf8' });

  return {
    configPath: configPath,
    saved: true
  };
}
