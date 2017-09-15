const getPort = require('get-port');
const liveServer = require('live-server');

module.exports = serve;

async function serve(config) {

  const port = config.port || await getPort({ port: 3000 });

  liveServer.start({
    port: port,
    root: config.buildDir,
    open: true,
    browser: process.env.BROWSER
  });
}
