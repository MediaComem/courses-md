const publish = require('../publish');

module.exports = async function publishCommand(config) {
  await publish(config);
};
