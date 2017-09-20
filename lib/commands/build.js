const EventEmitter = require('events');

const build = require('../build');
const { logCompiledFile, logProgress } = require('../logger');

module.exports = async function buildCommand(config) {

  const eventEmitter = new EventEmitter();
  eventEmitter.on('build:main-bundle', result => logCompiledFile(config, result.entryPointPath, result.bundlePath));
  eventEmitter.on('build:main-index', result => logCompiledFile(config, result.indexPath, result.compiledIndexPath));
  eventEmitter.on('build:subjects', () => logCompiledFile(config, `${config.absoluteSubjectsDir}/**/*`, config.absoluteBuildDir));

  const building = build(config, eventEmitter);

  await logProgress(building, 'Building...', 'Build successful');
};
