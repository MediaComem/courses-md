const _ = require('lodash');
const BPromise = require('bluebird');
const chalk = require('chalk');
const debug = require('debug')('courses-md:build');
const del = require('del');
const fs = require('fs-extra');
const globby = require('globby');
const marked = require('marked');
const ora = require('ora');
const path = require('path');
const prettyBytes = require('pretty-bytes');
const webpack = require('webpack');

const { compileSlides } = require('../slides');
const { getTemplate } = require('../templates');
const { toArray } = require('../utils');

module.exports = build;

async function build(config) {

  await del(config.buildDir);

  await fs.mkdirsAsync(config.buildDir);

  await BPromise.all([
    bundleAssets(config),
    processIndex(config),
    processContents(config)
  ]);
}

function bundleAssets(config) {

  const entryPointPath = path.join(config.assets, 'index.js');

  return BPromise.promisify(webpack)({
    entry: path.resolve(entryPointPath),
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [ require.resolve('style-loader'), require.resolve('css-loader') ]
        },
        {
          test: /\/vendor\/.*\.js$/,
          use: [
            {
              loader: require.resolve('script-loader')
            }
          ]
        },
        {
          test: /\.(gif|jpg|png|svg|eot|ttf|woff|woff2)$/,
          use: [
            {
              loader: require.resolve('file-loader'),
              options: {
                emitFile: true,
                name: `[name]-[hash].[ext]`
              }
            }
          ]
        }
      ]
    },
    output: {
      filename: 'bundle.js',
      path: path.resolve(config.buildDir)
    },
    plugins: [
    ],
    target: 'web'
  }).then(stats => {

    const jsonStats = stats.toJson();

    if (jsonStats.errors.length) {
      console.log(jsonStats.errors);
    }

    jsonStats.assets.forEach(asset => {
      debug(`${chalk.green(path.join(config.buildDir, asset.name))} ${chalk.magenta(prettyBytes(asset.size))}`)
    });

    const bundlePath = path.join(config.buildDir, 'bundle.js');
    ora(`${chalk.yellow(entryPointPath)} -> ${chalk.green(bundlePath)}`).succeed();
  });
}

function processIndex(config) {
  return BPromise
    .resolve()
    .then(() => fs.readFileAsync(path.join(config.srcDir, 'README.md'), { encoding: 'utf8' }))
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
        debug(`${chalk.yellow(sourcePath)} -> ${chalk.green(targetPath)}`);
      });
    })))
    .then(() => {
      ora(`${chalk.yellow(config.subjects + '/**/*.*')} -> ${chalk.green(config.buildDir)}`).succeed();
    });
}
