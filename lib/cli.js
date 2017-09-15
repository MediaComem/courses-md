const commander = require('commander');
const fs = require('fs');

const config = require('./config');
const pkg = require('../package');
const build = require('./commands/build');
const init = require('./commands/init');
const serve = require('./commands/serve');
const watch = require('./commands/watch');

module.exports = program;

function program(argv = process.argv) {

  let action;

  commander
    .version(pkg.version);

  commander
    .command('build')
    .action(() => {
      action = config.load().then(() => build(config));
    });

  commander
    .command('init')
    .action(() => {
      action = config.load().then(() => init(config));
    });

  commander
    .command('serve')
    .action(() => {
      action = config.load().then(() => serve(config));
    });

  commander
    .command('watch')
    .action(() => {
      action = config.load().then(() => watch(config));
    });

  commander.parse(argv);

  if (!action) {
    config.load().then(() => build(config)).then(() => {
      serve(config);
      watch(config);
    });
  }
}
