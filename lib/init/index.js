const EventEmitter = require('events');

const initClientBundle = require('./client-bundle');
const initEntryPoint = require('./entry-point');

module.exports = async function init(config, eventEmitter = new EventEmitter()) {

  await Promise.all([
    initClientBundle(config).then(result => eventEmitter.emit('init:client-bundle', result)),
    initEntryPoint(config).then(result => eventEmitter.emit('init:entry-point', result))
  ]);

  eventEmitter.emit('init');
};
