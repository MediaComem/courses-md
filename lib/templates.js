const fs = require('fs-extra');
const handlebars = require('handlebars');
const path = require('path');

const cache = {};
const templatesDir = path.join(__dirname, 'templates');

exports.getTemplate = getTemplate;

async function getTemplate(basename) {
  if (!cache[basename]) {
    const templatePath = path.join(templatesDir, basename);
    cache[basename] = handlebars.compile(await fs.readFileAsync(templatePath, { encoding: 'utf8' }));
  }

  return cache[basename];
}
