const BPromise = require('bluebird');
const cp = require('child_process');
const log4js = require('log4js');

const config = {
  assets: 'assets',
  buildDir: 'build',
  srcDir: '.',
  subjects: 'subjects',
  ignore: [ '**/node_modules/**' ],

  title: 'COMEM+ Web Dev',
  version: '2017-2018',
  repoUrl: 'https://github.com/MediaComem/comem-webdev',
  webUrl: 'https://mediacomem.github.io/comem-webdev-docs',
  sourceVersion: 'master',
  webfonts: true,
  remark: {
    highlightLines: true,
    highlightSpans: true,
    countIncrementalSlides: false
  }
};

config.load = function(force = false) {
  return BPromise.resolve(config);
};

let _logger;

Object.defineProperty(config, 'logger', {
  get: function() {
    if (!_logger) {
      log4js.configure({
        appenders: {
          out: {
            type: 'stdout',
            layout: {
              type: 'pattern',
              pattern: '[%d{hh:mm:ss}] %m'
            }
          }
        },
        categories: {
          default: {
            appenders: [ 'out' ],
            level: 'info'
          }
        }
      });

      _logger = log4js.getLogger();
      _logger.level = process.env.LOG_LEVEL || 'DEBUG';
    }

    return _logger;
  }
});

module.exports = config;
