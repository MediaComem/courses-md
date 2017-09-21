const chalk = require('chalk');
const EventEmitter = require('events');
const ora = require('ora');
const path = require('path');

const init = require('../init');
const { logNewOrExistingFile, logProgress } = require('../logger');

module.exports = async function initCommand(config) {

  const spinner = ora('Initializing...');

  const eventEmitter = new EventEmitter();
  eventEmitter.on('init:config', result => logNewOrExistingFile(config, result.configPath, result.saved));
  eventEmitter.on('init:entry-point', result => logNewOrExistingFile(config, result.entryPointPath, result.saved));
  eventEmitter.on('init:package', result => logNewOrExistingFile(config, result.packagePath, result.saved));
  eventEmitter.on('init:subject', result => logNewOrExistingFile(config, path.dirname(result.subjectPath), result.saved));
  eventEmitter.on('init:npm-install:start', () => spinner.text = `Running ${chalk.yellow('npm install')}...`);
  eventEmitter.on('init:npm-install', () => spinner.text = chalk.green('npm install'));
  eventEmitter.on('init', () => spinner.succeed(`Running ${chalk.yellow('npm start')}`));

  const initializing = init(config, eventEmitter);

  await logProgress(initializing, spinner, 'Initialized');
};
