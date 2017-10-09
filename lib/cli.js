const commander = require('commander');

const Config = require('./config');
const pkg = require('../package');
const build = require('./commands/build');
const publish = require('./commands/publish');
const serve = require('./commands/serve');
const watch = require('./commands/watch');

module.exports = program;

async function program(argv = process.argv) {

  let action = defaultAction;

  commander
    .option('-c, --config <file>', 'Path to the configuration file (defaults to "./config.js")')
    .option('-b, --build <dir>', 'Path to the build directory where HTML slideshows are saved (defaults to "./build")')
    .option('-t, --title <title>', 'Home page title (defaults to "Courses MD")')
    .option('--base-url <url>', 'Base URL at which the published slides will be available')
    .option('--repo-url <url>', 'Web URL of the repository where the Markdown source is committed (this should be the URL to the repository on GitHub, for example, not the Git URL)')
    .option('--publish-url <url>', 'Git URL of the repository to publish the HTML slides to')
    .option('--publish-branch <branch>', 'Branch to publish the HTML slides in (e.g. "gh-pages")')
    .option('--publish-version <version>', 'Version sub-directory to publish the slides in (defaults to the current year)')
    .version(pkg.version);

  commander
    .command('build')
    .description('Build the home page and all subjects\' HTML slideshows')
    .action(() => {
      action = build;
    });

  commander
    .command('publish')
    .description('Build and commit the home page and all subjects\' HTML slideshows into a Git repository (e.g. for GitHub Pages)')
    .action(() => {
      action = publish;
    });

  commander
    .command('serve')
    .description('Serve the static files in the build directory')
    .action(() => {
      action = serve;
    });

  commander
    .command('watch')
    .description('Watch for changes and recompile the home page and subjects when files are modified')
    .action(() => {
      action = watch;
    });

  commander.parse(argv);

  const config = await new Config().load(commander);

  return Promise
    .resolve(action(config))
    .catch(err => console.warn(err));
}

async function defaultAction(config) {
  await build(config);
  serve(config);
  watch(config);
}
