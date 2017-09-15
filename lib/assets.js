const fs = require('fs-extra');
const path = require('path');

const cache = {};
const assetsDir = path.join(__dirname, 'assets');

exports.getAsset = getAsset;

function getAsset(basename) {
  if (!cache[basename]) {
    const assetPath = path.join(assetsDir, basename);
    cache[basename] = fs.readFileSync(assetPath, { encoding: 'utf8' });
  }

  return cache[basename];
}
