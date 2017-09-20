const fs = require('fs-extra');
const marked = require('marked');
const path = require('path');

const { getTemplate } = require('../templates');

module.exports = async function buildMainIndex(config) {

  const indexPath = path.join(config.absoluteRootDir, 'README.md');
  const indexContents = await fs.readFile(indexPath, { encoding: 'utf8' });

  const templateFunc = await getTemplate('index.html');
  const compiledIndexContents = templateFunc({
    title: config.title,
    contents: marked(indexContents)
  });

  const compiledIndexPath = path.join(config.absoluteBuildDir, 'index.html');
  await fs.writeFile(compiledIndexPath, compiledIndexContents, { encoding: 'utf-8' });

  return {
    indexPath: indexPath,
    compiledIndexPath: compiledIndexPath
  };
}
