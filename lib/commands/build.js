const _ = require('lodash');
const BPromise = require('bluebird');
const chalk = require('chalk');
const fs = require('fs-extra');
const globby = require('globby');
const handlebars = require('handlebars');
const marked = require('marked');
const path = require('path');

const { compileSlides } = require('../slides');
const { toArray } = require('../utils');

module.exports = build;

function build(config) {
  return BPromise.all([
    copyAssets(config),
    processIndex(config),
    processContents(config)
  ]).then(() => console.log('build complete'));
}

function copyAssets(config) {
  return BPromise
    .resolve()
    .then(() => config.logger.debug(`${chalk.yellow(JSON.stringify(config.assets))} -> ${chalk.green(config.buildDir)}`))
    .then(() => BPromise.all(toArray(config.assets).map(assets => globby(assets))))
    .then(assets => _.flatten(assets))
    .then(assets => BPromise.all(assets.map(asset => {

      const sourcePath = path.join(config.srcDir, asset);
      const targetPath = path.join(config.buildDir, asset);

      return fs.copyAsync(sourcePath, targetPath).then(() => {
        config.logger.trace(`${chalk.yellow(sourcePath)} -> ${chalk.green(targetPath)}`);
      });
    })));
}

function processIndex(config) {
  return BPromise
    .resolve()
    .then(() => fs.readFileAsync(path.join(config.srcDir, 'README.md'), { encoding: 'utf8' }))
    .then(async contents => {
      const templateFunc = handlebars.compile(await fs.readFileAsync(path.join(__dirname, '..', 'templates', 'index.html'), { encoding: 'utf8' }));
      return templateFunc({
        title: config.title,
        contents: marked(contents)
      });
    }).then(async compiled => {
      await fs.writeFileAsync(path.join(config.buildDir, 'index.html'), compiled, { encoding: 'utf-8' });
      config.logger.debug(`${chalk.yellow('README.md')} -> ${chalk.green(path.join(config.buildDir, 'index.html'))}`);
    });
}

function processContents(config) {
  return BPromise
    .resolve()
    .then(() => {

      const patterns = [ '**/*.*' ];
      patterns.push(...config.ignore.map(ignore => `!${ignore}`));

      return globby(patterns, { cwd: config.subjects });
    })
    .then(files => BPromise.all(files.map(file => {
      if (file.match(/\.md$/)) {
        return compileSlides(config, file);
      }

      const sourcePath = path.join(config.subjects, file);
      const targetPath = path.join(config.buildDir, 'subjects', file);

      return fs.copyAsync(sourcePath, targetPath).then(() => {
        config.logger.trace(`${chalk.yellow(sourcePath)} -> ${chalk.green(targetPath)}`);
      });
    })));
}
