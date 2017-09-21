const fs = require('fs-extra');
const path = require('path');

const { getTemplate } = require('../templates');

module.exports = async function initReadme(config) {

  const rootDir = config.absoluteRootDir;
  const readmePath = path.join(rootDir, 'README.md');

  if (await fs.pathExists(readmePath)) {
    return {
      readmePath: readmePath,
      saved: false
    };
  }

  const templaceFunc = await getTemplate('README.md');
  const readmeContents = templaceFunc({});

  await fs.mkdirs(path.dirname(readmePath));

  await fs.writeFile(readmePath, readmeContents, { encoding: 'utf8' });

  return {
    readmePath: readmePath,
    saved: true
  };
};
