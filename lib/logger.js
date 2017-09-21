const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const pathIsInside = require('path-is-inside');

exports.logCompiledFile = function(config, sourcePath, targetPath) {
  ora(`${chalk.yellow(getRelativePath(config, sourcePath))} -> ${chalk.green(getRelativePath(config, targetPath))}`).succeed();
};

exports.logExistingFile = function(config, filePath) {
  ora(`${chalk.magenta(getRelativePath(config, filePath))} already exists`).info();
};

exports.logNewFile = function(config, filePath) {
  ora(`Saved ${chalk.green(getRelativePath(config, filePath))}`).succeed();
};

exports.logNewOrExistingFile = function(config, filePath, newFile) {
  if (newFile) {
    exports.logNewFile(config, filePath);
  } else {
    exports.logExistingFile(config, filePath);
  }
};

exports.logProgress = function(promise, progressMessage, successMessage, failureMessage) {

  let spinner;
  if (typeof(progressMessage) != 'string') {
    spinner = progressMessage.start();
  } else {
    spinner = ora(progressMessage).start();
  }

  return promise.then(() => {
    if (successMessage) {
      spinner.succeed(successMessage);
    } else {
      spinner.stop();
    }
  }, err => {
    if (failureMessage) {
      spinner.fail(failureMessage);
    } else {
      spinner.fail();
    }

    return Promise.reject(err);
  })
};

function getRelativePath(config, absolutePath) {
  const cwd = path.resolve(process.cwd());
  return pathIsInside(absolutePath, cwd) ? path.relative(cwd, absolutePath) : absolutePath;
}
