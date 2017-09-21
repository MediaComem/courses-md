const EventEmitter = require('events');

const initConfig = require('./config');
const initEntryPoint = require('./entry-point');
const initNpmInstall = require('./npm-install');
const initPackage = require('./package');
const initReadme = require('./readme');
const initSubject = require('./subject');

module.exports = async function init(config, eventEmitter = new EventEmitter()) {

  await Promise.all([
    initConfig(config).then(result => eventEmitter.emit('init:config', result)),
    initEntryPoint(config).then(result => eventEmitter.emit('init:entry-point', result)),
    initPackage(config).then(result => eventEmitter.emit('init:package', result)),
    initReadme(config).then(result => eventEmitter.emit('init:readme', result)),
    initSubject(config).then(result => eventEmitter.emit('init:subject', result))
  ]);

  eventEmitter.emit('init:npm-install:start');
  await initNpmInstall(config).then(result => eventEmitter.emit('init:npm-install', result));

  eventEmitter.emit('init');
};
