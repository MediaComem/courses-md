const _ = require('lodash');
const del = require('del');
const EventEmitter = require('events');
const fs = require('fs-extra');

const buildMainBundle = require('../build/main-bundle');
const buildMainIndex = require('../build/main-index');
const buildSubjects = require('../build/subjects');

module.exports = async function build(config, eventEmitter = new EventEmitter()) {

  await del(config.absoluteBuildDir);

  await fs.mkdirs(config.absoluteBuildDir);

  await Promise.all([
    buildMainBundle(config).then(result => eventEmitter.emit('build:main-bundle', result)),
    buildMainIndex(config).then(result => eventEmitter.emit('build:main-index', result)),
    buildSubjects(config).then(result => eventEmitter.emit('build:subjects', result))
  ]);

  eventEmitter.emit('build');
};
