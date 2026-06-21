const {
  createChatResponse,
  createRuntimeConfig,
  parseJsonBody,
} = require('../lib/chat-service');

async function chatHandler(req, res, config = createRuntimeConfig()) {
  try {
    const body = await parseJsonBody(req);
    const payload = await createChatResponse(body, { config });
    res.status(200).json(payload);
  } catch (error) {
    const statusCode = error.statusCode || 500;

    if (statusCode === 400) {
      res.status(statusCode).json({ error: error.message });
      return;
    }

    res.status(statusCode).json({
      role: 'assistant',
      message:
        '这次调用没有成功完成。我保留了当前会话信息，你可以稍后重试，或者先切换为演示模式继续展示。',
      error: error.message,
      phase: 'error',
    });
  }
}

module.exports = chatHandler;
