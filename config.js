const del = require('del');
const fs = require('fs-extra');
const path = require('path');

const { execute } = require('./lib/utils');

exports.title = 'Courses MD';
exports.build = 'docs/md';

exports.publish = {
  gitUrl: 'git@github.com:MediaComem/courses-md.git',
  branch: 'gh-pages',
  version: '2017',
  afterBuild: afterBuild
};

async function afterBuild(config, tmpDir) {
  if (!tmpDir) {
    throw new Error(`Temporary directory is required, got ${tmpDir}`);
  }

  const esdocPath = path.join(tmpDir, 'api');
  await del(esdocPath, { force: true });

  const esdocConfig = require('./.esdoc.json');
  esdocConfig.destination = esdocPath;

  const tmpEsdocConfig = path.join(tmpDir, '.esdoc.json');
  await fs.writeFile(tmpEsdocConfig, JSON.stringify(esdocConfig), 'utf8');

  await execute([ './node_modules/.bin/esdoc', '-c', tmpEsdocConfig ]);

  await del(tmpEsdocConfig, { force: true });
}
