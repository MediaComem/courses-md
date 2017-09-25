const _ = require('lodash');
const cp = require('child_process');
const shellEscape = require('shell-escape');
const tmp = require('tmp');
const webpack = require('webpack');

tmp.setGracefulCleanup();

exports.createTemporaryDirectory = function(options = {}) {
  return new Promise((resolve, reject) => {
    tmp.dir(options, (err, path, clean) => {
      if (err) {
        reject(err);
      } else {
        resolve(path);
      }
    });
  })
}

exports.execute = function(args, options = {}) {
  return new Promise((resolve, reject) => {
    cp.exec(shellEscape(args), options, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

exports.toArray = function(value) {
  return _.isArray(value) ? value : _.compact([ value ]);
};

exports.runWebpack = function(config) {
  return new Promise((resolve, reject) => {
    webpack(config, (err, stats) => {
      if (err) {
        return reject(err);
      }

      const jsonStats = stats.toJson();
      if (jsonStats.errors.length) {
        return reject(new Error(`Errors occurred while running webpack:\n\n${jsonStats.errors.join('\n\n')}`));
      }

      resolve(jsonStats);
    });
  });
};
