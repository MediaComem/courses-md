const chalk = require('chalk');
const chokidar = require('chokidar');
const debug = require('debug')('courses-md:watch');
const fs = require('fs-extra');
const path = require('path');

const { buildSubjectBundle, buildSubjects } = require('../build');
const { compileSlides } = require('../slides');

module.exports = watch;

function watch(config) {

  const watchers = [];

  debug(`Watching ${config.absoluteSubjectsDir}...`);
  const contentWatcher = chokidar.watch('.', {
    cwd: config.absoluteSubjectsDir,
    ignored: [ '**/.*', '**/node_modules/**/*' ],
    ignoreInitial: true
  });

  contentWatcher
    .on('add', contentFileChangeHandler(config))
    .on('change', contentFileChangeHandler(config));

  const absoluteSubjectEntryPointDir = path.dirname(config.absoluteSubjectEntryPointFile);
  debug(`Watching ${absoluteSubjectEntryPointDir}...`);
  const subjectEntryPointWatcher = chokidar.watch('.', {
    cwd: absoluteSubjectEntryPointDir,
    ignored: [ '**/.*', '**/node_modules/**/*' ],
    ignoreInitial: true
  });

  subjectEntryPointWatcher
    .on('add', subjectEntryPointFileChangeHandler(config, absoluteSubjectEntryPointDir))
    .on('change', subjectEntryPointFileChangeHandler(config, absoluteSubjectEntryPointDir));

  watchers.push(contentWatcher);
  watchers.push(subjectEntryPointWatcher);

  return {
    close: watchers => watcher.close()
  };
}

function contentFileChangeHandler(config) {
  return async function(relativeFilePath) {

    const filePath = path.join(config.absoluteSubjectsDir, relativeFilePath);
    debug(`${chalk.yellow(filePath)} changed...`);

    if (filePath.match(/\.md$/)) {
      const subjectBundlePath = await findSubjectBundle(config);
      compileSlides(config, path.relative(config.absoluteSubjectsDir, filePath), subjectBundlePath);
    } else {

      const targetPath = path.join(config.absoluteBuildDir, 'subjects', relativeFilePath);

      await fs.copy(filePath, targetPath);

      debug(`${chalk.yellow(filePath)} -> ${chalk.green(targetPath)}`);
    }
  };
}

function subjectEntryPointFileChangeHandler(config, directory) {
  return async function(relativeFilePath) {

    const filePath = path.join(directory, relativeFilePath);
    debug(`${chalk.yellow(filePath)} changed...`);

    buildSubjectBundle(config).then(result => {
      debug(`${chalk.yellow(result.entryPointPath)} -> ${chalk.green(result.bundlePath)}`);
      return buildSubjects(config, result.bundlePath);
    });
  };
}

async function findSubjectBundle(config) {

  const buildFiles = await fs.readdir(config.absoluteBuildDir);
  const matchingFiles = buildFiles.filter(filename => filename.match(/^subject(?:-[a-z0-9]+)?.js$/));

  if (matchingFiles.length === 0) {
    throw new Error(`No subject bundle found in ${config.absoluteBuildDir}; make sure to use "build" at least once before "watch"`);
  } else if (matchingFiles.length != 1) {
    throw new Error(`Multiple subject bundles found in ${config.absoluteBuildDir}: ${matchingFiles.join(', ')}`);
  }

  return path.relative(config.absoluteBuildDir, matchingFiles[0]);
}
