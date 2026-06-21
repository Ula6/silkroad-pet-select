const test = require('node:test');
const assert = require('node:assert/strict');

const {
  createRuntimeConfig,
  createHealthPayload,
  createChatResponse,
} = require('../lib/chat-service');
const healthHandler = require('../api/health');
const chatHandler = require('../api/chat');

function createMockRes() {
  return {
    statusCode: 200,
    headers: {},
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(name, value) {
      this.headers[name] = value;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
}

test('createRuntimeConfig detects Vercel deployment target', () => {
  const config = createRuntimeConfig({
    VERCEL: '1',
    VERCEL_URL: 'silkroad-demo.vercel.app',
    COZE_WORKFLOW_RUN_URL: 'https://example.coze.site/run',
  });

  assert.equal(config.runtimeTarget, 'vercel');
  assert.equal(config.publicBaseUrl, 'https://silkroad-demo.vercel.app');
  assert.equal(config.workflowRunUrl, 'https://example.coze.site/run');
});

test('createHealthPayload returns share-friendly metadata for Vercel mode', () => {
  const payload = createHealthPayload(
    createRuntimeConfig({
      VERCEL: '1',
      VERCEL_URL: 'silkroad-demo.vercel.app',
    })
  );

  assert.equal(payload.ok, true);
  assert.equal(payload.runtimeTarget, 'vercel');
  assert.equal(payload.accessMode, 'public_url');
  assert.match(payload.networkHint, /https:\/\/silkroad-demo\.vercel\.app/);
});

test('createChatResponse falls back to demo workflow output when no token is configured', async () => {
  const response = await createChatResponse(
    {
      message: '我想做美国市场的宠物玩具，预算10到20万，偏稳健一点。',
      slots: {},
    },
    {
      config: createRuntimeConfig({}),
      fetchImpl: async () => {
        throw new Error('fetch should not be called in demo mode');
      },
    }
  );

  assert.equal(response.role, 'assistant');
  assert.equal(response.phase, 'report');
  assert.ok(Array.isArray(response.sections));
  assert.match(response.message, /选品分析/);
});

test('api health handler exposes deployment metadata', async () => {
  const req = {
    method: 'GET',
    headers: {},
  };
  const res = createMockRes();

  await healthHandler(
    req,
    res,
    createRuntimeConfig({
      VERCEL: '1',
      VERCEL_URL: 'silkroad-demo.vercel.app',
    })
  );

  assert.equal(res.statusCode, 200);
  assert.equal(res.body.runtimeTarget, 'vercel');
  assert.equal(res.body.accessMode, 'public_url');
});

test('api chat handler rejects empty message payload', async () => {
  const req = {
    method: 'POST',
    body: {},
    headers: { 'content-type': 'application/json' },
  };
  const res = createMockRes();

  await chatHandler(req, res, createRuntimeConfig({}));

  assert.equal(res.statusCode, 400);
  assert.equal(res.body.error, 'message is required');
});
