const fs = require('fs-extra');
const handlebars = require('handlebars');
const path = require('path');

const cache = {};

exports.getTemplate = getTemplate;

async function getTemplate(relativeTemplatePath) {

  const templatePath = path.resolve(relativeTemplatePath);
  if (!cache[templatePath]) {
    cache[templatePath] = handlebars.compile(await fs.readFile(templatePath, { encoding: 'utf8' }));
  }

  return cache[templatePath];
}
