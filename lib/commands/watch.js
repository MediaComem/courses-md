const chalk = require('chalk');
const chokidar = require('chokidar');
const debug = require('debug')('watch');
const fs = require('fs-extra');
const path = require('path');

const { compileSlides } = require('../slides');

module.exports = watch;

function watch(config) {

  const watchers = [];

  debug(`Watching ${config.absoluteSubjectsDir}...`);
  const watcher = chokidar.watch('.', {
    cwd: config.absoluteSubjectsDir,
    ignored: [ '**/.*', '**/node_modules/**/*' ],
    ignoreInitial: true
  });

  watchers.push(watcher);

  watcher
    .on('add', fileChangeHandler(config))
    .on('change', fileChangeHandler(config));

  return {
    close: watchers => watcher.close()
  };
}

function fileChangeHandler(config) {
  return function(relativeFilePath) {

    const filePath = path.join(config.absoluteSubjectsDir, relativeFilePath);
    debug(`${chalk.yellow(filePath)} changed...`);

    if (filePath.match(/\.md$/)) {
      compileSlides(config, path.relative(config.absoluteSubjectsDir, filePath));
    } else {

      const targetPath = path.join(config.absoluteBuildDir, relativeFilePath);

      return fs.copy(filePath, targetPath).then(() => {
        debug(`${chalk.yellow(filePath)} -> ${chalk.green(targetPath)}`);
      });
    }
  };
}
