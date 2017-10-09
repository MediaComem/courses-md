exports.title = 'Courses MD';
exports.build = 'docs/md';
exports.publish = {
  url: 'git@github.com:AlphaHydrae/courses-md.git',
  branch: 'gh-pages',
  version: '2017',
  afterBuild: async function() {
    console.log('@@@ after build');
  }
};
