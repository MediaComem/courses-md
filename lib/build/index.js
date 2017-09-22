const _ = require('lodash');
const chalk = require('chalk');
const debug = require('debug')('courses-md:build');
const del = require('del');
const EventEmitter = require('events');
const fs = require('fs-extra');
const globby = require('globby');
const marked = require('marked');
const path = require('path');
const prettyBytes = require('pretty-bytes');

const { compileSlides } = require('../slides');
const { getTemplate } = require('../templates');
const { runWebpack } = require('../utils');
const webpackBuildConfig = require('./webpack.build');

module.exports = async function build(config, eventEmitter = new EventEmitter()) {

  await del(config.absoluteBuildDir);

  await fs.mkdirs(config.absoluteBuildDir);

  const [ homeBundleResult, slidesBundleResult ] = await Promise.all([
    await buildHomeBundle(config).then(result => {
      eventEmitter.emit('build:home-bundle', result);
      return result;
    }),
    await buildSlidesBundle(config).then(result => {
      eventEmitter.emit('build:slides-bundle', result);
      return result;
    })
  ]);

  const homeBundlePath = homeBundleResult.bundlePath;
  const slidesBundlePath = slidesBundleResult.bundlePath;

  await Promise.all([
    buildHome(config, homeBundlePath).then(result => eventEmitter.emit('build:home', result)),
    buildSubjects(config, slidesBundlePath).then(result => eventEmitter.emit('build:subjects', result))
  ]);

  eventEmitter.emit('build');
};

async function buildHomeBundle(config) {

  const entryPointPath = config.absoluteHomeEntryPointFile;
  if (!(await fs.pathExists(entryPointPath))) {
    return {
      entryPointPath: entryPointPath,
      saved: false
    };
  }

  const buildDir = config.absoluteBuildDir;
  const bundleName = 'home';

  const stats = await runWebpack(webpackBuildConfig(entryPointPath, buildDir, bundleName));

  stats.assets.forEach(asset => {
    debug(`${chalk.green(path.join(config.absoluteBuildDir, asset.name))} ${chalk.magenta(prettyBytes(asset.size))}`)
  });

  const bundlePath = path.join(buildDir, stats.assetsByChunkName.main);

  return {
    entryPointPath: entryPointPath,
    bundlePath: bundlePath,
    saved: true
  };
}

async function buildSlidesBundle(config) {

  const entryPointPath = config.absoluteSlidesEntryPointFile;
  const buildDir = config.absoluteBuildDir;
  const bundleName = 'slides';

  const stats = await runWebpack(webpackBuildConfig(entryPointPath, buildDir, bundleName));

  stats.assets.forEach(asset => {
    debug(`${chalk.green(path.join(config.absoluteBuildDir, asset.name))} ${chalk.magenta(prettyBytes(asset.size))}`)
  });

  const bundlePath = path.join(buildDir, stats.assetsByChunkName.main);

  return {
    entryPointPath: entryPointPath,
    bundlePath: bundlePath
  };
}

async function buildHome(config, homeBundlePath) {

  const indexPath = path.join(config.absoluteRootDir, 'README.md');
  const indexContents = await fs.readFile(indexPath, { encoding: 'utf8' });

  const templateFunc = await getTemplate('index.html');
  const compiledIndexContents = templateFunc({
    title: config.title,
    contents: marked(indexContents),
    homeBundlePath: `./${path.relative(config.absoluteBuildDir, homeBundlePath)}`
  });

  const compiledIndexPath = path.join(config.absoluteBuildDir, 'index.html');
  await fs.writeFile(compiledIndexPath, compiledIndexContents, { encoding: 'utf-8' });

  return {
    indexPath: indexPath,
    compiledIndexPath: compiledIndexPath
  };
}

async function buildSubjects(config, slidesBundlePath) {

  const patterns = [ '**/*.*' ];
  patterns.push(...config.ignore.map(ignore => `!${ignore}`));

  const files = await globby(patterns, { cwd: config.absoluteSubjectsDir });

  await Promise.all(files.map(async file => {

    if (file.match(/\.md$/)) {
      return compileSlides(config, file, slidesBundlePath);
    }

    const sourcePath = path.join(config.absoluteSubjectsDir, file);
    const targetPath = path.join(config.absoluteBuildDir, 'subjects', file);

    await fs.copy(sourcePath, targetPath);

    debug(`${chalk.yellow(sourcePath)} -> ${chalk.green(targetPath)}`);
  }));
}
