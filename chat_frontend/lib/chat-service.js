const fs = require('node:fs');
const path = require('node:path');

const {
  extractSlots,
  getMissingFields,
  buildWorkflowPayload,
  buildFollowupMessage,
  formatAssistantSections,
} = require('./workflow');

const demoResults = JSON.parse(
  fs.readFileSync(path.join(__dirname, '..', 'demo', 'scenario-results.json'), 'utf8')
);

const DEFAULT_WORKFLOW_RUN_URL = 'https://bgxb7zbzsz.coze.site/run';

function createRuntimeConfig(env = process.env) {
  const port = Number(env.PORT || 3210);
  const host = env.HOST || '0.0.0.0';
  const workflowRunUrl = env.COZE_WORKFLOW_RUN_URL || DEFAULT_WORKFLOW_RUN_URL;
  const bearerToken = env.COZE_BEARER_TOKEN || '';
  const runtimeTarget = env.VERCEL ? 'vercel' : 'local';
  const publicBaseUrl =
    env.PUBLIC_BASE_URL || (env.VERCEL_URL ? `https://${env.VERCEL_URL}` : '');

  return {
    port,
    host,
    workflowRunUrl,
    bearerToken,
    runtimeTarget,
    publicBaseUrl,
  };
}

function createAssistantReply(message, slots, sections = [], phase = 'idle') {
  return {
    role: 'assistant',
    message,
    sections,
    slots,
    phase,
  };
}

function pickDemoResult(payload) {
  const market = payload.target_market || '';
  const direction = payload.product_direction || '';
  const risk = payload.risk_preference || '';

  if (market.includes('美国') && direction.includes('玩具')) {
    return demoResults.us_toy;
  }

  if (
    (market.includes('东南亚') || market.includes('马来西亚') || market.includes('新加坡')) &&
    (direction.includes('清洁') || direction.includes('猫砂') || direction.includes('清洗'))
  ) {
    return demoResults.sea_clean;
  }

  if (
    (direction.includes('猫') || direction.includes('猫咪')) &&
    (direction.includes('利润') || risk.includes('稳健'))
  ) {
    return demoResults.cat_profit;
  }

  return demoResults.default;
}

async function callWorkflow(payload, options = {}) {
  const config = options.config || createRuntimeConfig();
  const fetchImpl = options.fetchImpl || global.fetch;

  if (!config.bearerToken) {
    return pickDemoResult(payload);
  }

  const response = await fetchImpl(config.workflowRunUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${config.bearerToken}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Workflow request failed: ${response.status} ${text}`);
  }

  return response.json();
}

function createHealthPayload(config = createRuntimeConfig()) {
  const liveMode = Boolean(config.bearerToken);
  const accessMode =
    config.runtimeTarget === 'vercel'
      ? 'public_url'
      : config.host === '0.0.0.0'
        ? 'lan'
        : 'local_only';

  const networkHint =
    accessMode === 'public_url'
      ? `公网可访问地址：${config.publicBaseUrl || '部署完成后由平台分配域名'}`
      : accessMode === 'lan'
        ? '同一局域网设备可通过本机 IP + 端口访问'
        : `当前仅限 ${config.host}:${config.port} 访问`;

  return {
    ok: true,
    host: config.host,
    port: config.port,
    mode: liveMode ? 'live' : 'demo',
    modeLabel: liveMode ? '联调运行版' : '答辩展示版',
    modeDescription: liveMode
      ? '当前页面已连接 Coze 已部署工作流，可直接进行真实链路演示。'
      : '当前页面用于答辩展示与讲解，展示结果按典型业务场景预置生成。',
    workflowRunUrl: config.workflowRunUrl,
    runtimeTarget: config.runtimeTarget,
    accessMode,
    networkHint,
    publicBaseUrl: config.publicBaseUrl,
  };
}

function normalizeSlots(value) {
  return value && typeof value === 'object' ? value : {};
}

async function createChatResponse(body, options = {}) {
  const config = options.config || createRuntimeConfig();
  const incomingMessage = String(body?.message || '').trim();
  const currentSlots = normalizeSlots(body?.slots);

  if (!incomingMessage) {
    const error = new Error('message is required');
    error.statusCode = 400;
    throw error;
  }

  const mergedSlots = extractSlots(incomingMessage, currentSlots);
  const missing = getMissingFields(mergedSlots);

  if (missing.length) {
    return createAssistantReply(
      buildFollowupMessage(mergedSlots),
      mergedSlots,
      [],
      'followup'
    );
  }

  const payload = buildWorkflowPayload(mergedSlots);
  const result = await callWorkflow(payload, {
    config,
    fetchImpl: options.fetchImpl,
  });
  const formatted = formatAssistantSections(result);

  return createAssistantReply(
    '我已经根据你的需求完成了一轮选品分析，下面是可直接展示的业务化结果。',
    mergedSlots,
    formatted.sections,
    'report'
  );
}

async function parseJsonBody(req) {
  if (req.body && typeof req.body === 'object') {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return req.body ? JSON.parse(req.body) : {};
  }

  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

module.exports = {
  createRuntimeConfig,
  createHealthPayload,
  createChatResponse,
  parseJsonBody,
};
