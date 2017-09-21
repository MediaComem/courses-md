const fs = require('fs-extra');
const path = require('path');

const pkg = require('../../package');
const { getTemplate } = require('../templates');

module.exports = async function initPackage(config) {

  const packagePath = path.join(config.absoluteRootDir, 'package.json');
  if (await fs.pathExists(packagePath)) {
    return {
      packagePath: packagePath,
      saved: false
    };
  }

  const templateFunc = await getTemplate('package.json.hbs');

  const packageContents = templateFunc({
    version: `~${pkg.version}`
  }, {
    helpers: {
      json: function(contents) {
        return JSON.stringify(contents);
      }
    }
  });

  await fs.writeFile(packagePath, packageContents, { encoding: 'utf8' });

  return {
    packagePath, packagePath,
    saved: true
  };
}
