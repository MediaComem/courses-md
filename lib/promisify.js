const BPromise = require('bluebird');

[ 'fs-extra' ].forEach(lib => BPromise.promisifyAll(require(lib)));
