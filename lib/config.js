const cp = require('child_process');

const config = {
  buildDir: 'build',
  rootDir: '.',
  subjectsDir: 'subjects',
  ignore: [ '**/node_modules/**' ],
  srcDir: 'src',
  vendorDir: 'vendor',

  title: 'COMEM+ Web Dev',
  version: '2017-2018',
  repoUrl: 'https://github.com/MediaComem/comem-webdev',

  webUrl: 'https://mediacomem.github.io/comem-webdev-docs',
  sourceVersion: 'master',
  remark: {}
};

config.load = function(force = false) {
  return Promise.resolve(config);
};

config.getSourceVersion = function() {
  return cp.execSync('git rev-parse --abbrev-ref HEAD', { cwd: __dirname }).toString().trim();
};

module.exports = config;
