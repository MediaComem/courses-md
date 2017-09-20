const chalk = require('chalk');
const debug = require('debug')('courses-md:build:subjects');
const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');

const { compileSlides } = require('../slides');

module.exports = async function buildSubjects(config) {

  const patterns = [ '**/*.*' ];
  patterns.push(...config.ignore.map(ignore => `!${ignore}`));

  const files = await globby(patterns, { cwd: config.absoluteSubjectsDir });

  await Promise.all(files.map(async file => {

    if (file.match(/\.md$/)) {
      return compileSlides(config, file);
    }

    const sourcePath = path.join(config.absoluteSubjectsDir, file);
    const targetPath = path.join(config.absoluteBuildDir, 'subjects', file);

    await fs.copy(sourcePath, targetPath);

    debug(`${chalk.yellow(sourcePath)} -> ${chalk.green(targetPath)}`);
  }));
};
