const BPromise = require('bluebird');
const cp = require('child_process');

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

module.exports = config;
