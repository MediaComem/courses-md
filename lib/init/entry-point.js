const fs = require('fs-extra');
const path = require('path');

const { getTemplate } = require('../templates');

module.exports = async function initEntryPoint(config) {

  const entryPointPath = config.entryPointPath;
  if (await fs.pathExists(entryPointPath)) {
    return {
      entryPointPath: entryPointPath,
      saved: false
    };
  }

  await fs.mkdirs(path.dirname(entryPointPath));

  const templateFunc = await getTemplate('entry-point.js');

  const clientBundlePath = config.clientBundlePath;
  const relativeClientBundlePath = path.relative(path.dirname(entryPointPath), clientBundlePath);

  const entryPointContents = templateFunc({
    clientBundlePath: relativeClientBundlePath
  });

  await fs.writeFile(entryPointPath, entryPointContents, { encoding: 'utf8' });

  return {
    entryPointPath: entryPointPath,
    saved: true
  };
}
