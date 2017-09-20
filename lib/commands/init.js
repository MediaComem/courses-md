const chalk = require('chalk');
const EventEmitter = require('events');
const fs = require('fs-extra');
const ora = require('ora');
const path = require('path');
const request = require('request-promise');

const clientWebpackConfig = require('../init/webpack.client');
const { getTemplate } = require('../templates');
const { runWebpack } = require('../utils');
const initClientBundle = require('../init/client-bundle');
const initEntryPoint = require('../init/entry-point');

const init = require('../init');
const { logNewOrExistingFile, logProgress } = require('../logger');

module.exports = async function initCommand(config) {

  const eventEmitter = new EventEmitter();
  eventEmitter.on('init:client-bundle', result => logNewOrExistingFile(config, result.clientBundlePath, result.saved));
  eventEmitter.on('init:entry-point', result => logNewOrExistingFile(config, result.entryPointPath, result.saved));

  const initializing = init(config, eventEmitter);

  await logProgress(initializing, 'Initializing...', 'Initialized');
};
