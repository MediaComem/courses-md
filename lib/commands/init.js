const BPromise = require('bluebird');
const chalk = require('chalk');
const fs = require('fs-extra');
const ora = require('ora');
const path = require('path');
const request = require('request-promise');

const { getTemplate } = require('../templates');

const DEFAULT_ASSETS = [
  'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.2.1/jquery.slim.js',
  'https://cdnjs.cloudflare.com/ajax/libs/remark/0.14.0/remark.js',
  'https://cdnjs.cloudflare.com/ajax/libs/unsemantic/1.1.3/unsemantic-grid-base.css',
  'https://cdnjs.cloudflare.com/ajax/libs/unsemantic/1.1.3/unsemantic-grid-desktop.css',
  'https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.18.12/URI.js',
  'https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.18.12/IPv6.js',
  'https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.18.12/punycode.js',
  'https://cdnjs.cloudflare.com/ajax/libs/URI.js/1.18.12/SecondLevelDomains.js'
];

module.exports = init;

async function init(config) {
  await downloadAssets(config);
  await buildClient(config);
  await saveAssetsManifest(config);
}

async function buildClient(config) {

  const courseFilePath = path.resolve(path.join(__dirname, '..', 'client', 'course.js'));
  const courseFile = await fs.readFileAsync(courseFilePath, { encoding: 'utf8' });
  const targetPath = path.join(config.assets, 'vendor', 'course.js');
  await fs.writeFileAsync(targetPath, courseFile, { encoding: 'utf8' });
  ora(`${chalk.yellow(courseFilePath)} -> ${chalk.green(targetPath)}`).succeed();

  const styleFilePath = path.resolve(path.join(__dirname, '..', 'client', 'course.css'));
  const styleFile = await fs.readFileAsync(styleFilePath, { encoding: 'utf8' });
  const styleTargetPath = path.join(config.assets, 'vendor', 'course.css');
  await fs.writeFileAsync(styleTargetPath, styleFile, { encoding: 'utf8' });
  ora(`${chalk.yellow(styleFilePath)} -> ${chalk.green(styleTargetPath)}`).succeed();
}

async function saveAssetsManifest(config) {

  const templateFunc = await getTemplate('assets-manifest.js');
  const contents = templateFunc({
    assets: [ ...DEFAULT_ASSETS.map(asset => `./${getAssetRelativePath(asset)}`), './vendor/course.js', './vendor/course.css' ].sort()
  }, {
    helpers: {
      json: function(contents) {
        return JSON.stringify(contents);
      }
    }
  });

  const manifestPath = path.join(config.assets, 'vendor.js');
  await fs.writeFileAsync(manifestPath, contents, { encoding: 'utf8' });

  ora(`Saved vendored assets manifest to ${chalk.magenta(manifestPath)}`).succeed();
}

async function downloadAssets(config) {

  const assetContentsPromise = BPromise.all(DEFAULT_ASSETS.map(asset => request(asset)));
  ora.promise(assetContentsPromise, `Downloading ${DEFAULT_ASSETS.length} assets...`);

  const assetContents = await assetContentsPromise;

  await fs.mkdirsAsync(path.join(config.assets, 'vendor'));

  await DEFAULT_ASSETS.map(async (asset, i) => {
    const targetPath = path.join(config.assets, getAssetRelativePath(asset));
    await fs.writeFileAsync(targetPath, assetContents[i], { encoding: 'utf8' });
    console.log(`○ ${chalk.green(targetPath)}`);
  });
}

function getAssetRelativePath(asset) {
  return path.join('vendor', path.basename(asset));
}
