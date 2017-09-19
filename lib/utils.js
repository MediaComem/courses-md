const _ = require('lodash');
const webpack = require('webpack');

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
