const { createHealthPayload, createRuntimeConfig } = require('../lib/chat-service');

async function healthHandler(req, res, config = createRuntimeConfig()) {
  res.status(200).json(createHealthPayload(config));
}

module.exports = healthHandler;
