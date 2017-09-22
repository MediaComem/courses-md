const commander = require('commander');

const Config = require('./config');
const pkg = require('../package');
const build = require('./commands/build');
const serve = require('./commands/serve');
const watch = require('./commands/watch');

module.exports = program;

async function program(argv = process.argv) {

  let action = defaultAction;
  let options = {};

  commander
    .version(pkg.version);

  commander
    .command('build')
    .action(() => {
      action = build;
    });

  commander
    .command('serve')
    .action(() => {
      action = serve;
    });

  commander
    .command('watch')
    .action(() => {
      action = watch;
    });

  commander.parse(argv);

  const config = await new Config().load(options);
  return Promise
    .resolve(action(config))
    .catch(err => console.warn(err));
}

async function defaultAction(config) {
  await build(config);
  serve(config);
  watch(config);
}
