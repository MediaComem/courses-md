const _ = require('lodash');

exports.toArray = function(value) {
  return _.isArray(value) ? value : _.compact([ value ]);
};
