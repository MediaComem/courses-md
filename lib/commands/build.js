const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('courses-md:build');
const del = require('del');
const fs = require('fs-extra');
const globby = require('globby');
const marked = require('marked');
const ora = require('ora');
const path = require('path');
const prettyBytes = require('pretty-bytes');

const { compileSlides } = require('../slides');
const { getTemplate } = require('../templates');
const { runWebpack, toArray } = require('../utils');
const webpackSlidesConfig = require('./webpack.slides');

module.exports = build;

async function build(config) {

  await del(config.buildDir);

  await fs.mkdirsAsync(config.buildDir);

  await Promise.all([
    bundleAssets(config),
    processIndex(config),
    processContents(config)
  ]);
}

function bundleAssets(config) {

  const entryPointPath = path.join(config.srcDir, 'index.js');

  return runWebpack(webpackSlidesConfig(entryPointPath)).then(stats => {

    stats.assets.forEach(asset => {
      debug(`${chalk.green(path.join(config.buildDir, asset.name))} ${chalk.magenta(prettyBytes(asset.size))}`)
    });

    const bundlePath = path.join(config.buildDir, 'bundle.js');
    ora(`${chalk.yellow(entryPointPath)} -> ${chalk.green(bundlePath)}`).succeed();
  });
}

function processIndex(config) {
  return Promise
    .resolve()
    .then(() => fs.readFileAsync(path.join(config.rootDir, 'README.md'), { encoding: 'utf8' }))
    .then(async contents => {
      const templateFunc = await getTemplate('index.html');
      return templateFunc({
        title: config.title,
        contents: marked(contents)
      });
    }).then(async compiled => {
      await fs.writeFileAsync(path.join(config.buildDir, 'index.html'), compiled, { encoding: 'utf-8' });
      ora(`${chalk.yellow('README.md')} -> ${chalk.green(path.join(config.buildDir, 'index.html'))}`).succeed();
    });
}

function processContents(config) {
  return Promise
    .resolve()
    .then(() => {

      const patterns = [ '**/*.*' ];
      patterns.push(...config.ignore.map(ignore => `!${ignore}`));

      return globby(patterns, { cwd: config.subjectsDir });
    })
    .then(files => Promise.all(files.map(file => {
      if (file.match(/\.md$/)) {
        return compileSlides(config, file);
      }

      const sourcePath = path.join(config.subjectsDir, file);
      const targetPath = path.join(config.buildDir, 'subjects', file);

      return fs.copyAsync(sourcePath, targetPath).then(() => {
        debug(`${chalk.yellow(sourcePath)} -> ${chalk.green(targetPath)}`);
      });
    })))
    .then(() => {
      ora(`${chalk.yellow(config.subjectsDir + '/**/*.*')} -> ${chalk.green(config.buildDir)}`).succeed();
    });
}
