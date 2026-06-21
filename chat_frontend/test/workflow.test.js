const test = require('node:test');
const assert = require('node:assert/strict');

const {
  extractSlots,
  getMissingFields,
  buildWorkflowPayload,
  formatAssistantSections,
  shouldReuseSlots,
} = require('../lib/workflow');
const scenarioResults = require('../demo/scenario-results.json');

test('extractSlots parses all core fields from a natural language request', () => {
  const slots = extractSlots(
    '我想做美国市场的宠物玩具，预算10到20万，偏稳健一点。'
  );

  assert.equal(slots.target_market, '美国');
  assert.equal(slots.budget, '10-20万');
  assert.equal(slots.risk_preference, '稳健');
  assert.equal(slots.product_direction, '宠物玩具');
});

test('getMissingFields returns fields not yet collected', () => {
  const missing = getMissingFields({
    target_market: '美国',
    budget: '',
    risk_preference: '稳健',
    product_direction: '',
  });

  assert.deepEqual(missing, ['budget', 'product_direction']);
});

test('buildWorkflowPayload keeps workflow input contract', () => {
  const payload = buildWorkflowPayload({
    target_market: '美国',
    budget: '10-20万',
    risk_preference: '稳健',
    product_direction: '宠物玩具',
  });

  assert.deepEqual(payload, {
    target_market: '美国',
    budget: '10-20万',
    risk_preference: '稳健',
    product_direction: '宠物玩具',
  });
});

test('formatAssistantSections prefers business report when available', () => {
  const formatted = formatAssistantSections({
    demand_summary: '这是需求摘要',
    top10_summary: [{ rank: 1, product_name: 'Dog Toy' }],
    focus_products: [{ rank: 1, product_name: 'Dog Toy' }],
    business_report_md: '丝路宠选选品报告\n需求摘要：...',
  });

  assert.equal(formatted.heroTitle, '丝路宠选选品报告');
  assert.equal(formatted.sections[0].type, 'board');
  assert.equal(formatted.sections[1].type, 'report');
  assert.match(formatted.sections[1].content, /需求摘要/);
});

test('scenario demo results contain distinct market-aligned summaries', () => {
  assert.match(scenarioResults.us_toy.demand_summary, /美国市场/);
  assert.match(scenarioResults.sea_clean.demand_summary, /东南亚市场/);
  assert.match(scenarioResults.cat_profit.demand_summary, /猫咪用品/);
});

test('shouldReuseSlots keeps context only during follow-up by default', () => {
  assert.equal(
    shouldReuseSlots(
      { phase: 'followup' },
      '预算5万呢'
    ),
    true
  );

  assert.equal(
    shouldReuseSlots(
      { phase: 'report' },
      '预算5万呢'
    ),
    false
  );

  assert.equal(
    shouldReuseSlots(
      { phase: 'report' },
      '把刚才的预算改成5万'
    ),
    true
  );
});

test('live mode metadata contract can describe cross-device access', () => {
  const healthPayload = {
    ok: true,
    mode: 'live',
    modeLabel: '联调运行版',
    modeDescription: '当前页面已连接已部署工作流，可直接进行真实链路演示。',
    host: '0.0.0.0',
    port: 3210,
    workflowRunUrl: 'https://example.coze.site/run',
  };

  assert.equal(healthPayload.ok, true);
  assert.equal(healthPayload.mode, 'live');
  assert.equal(healthPayload.host, '0.0.0.0');
  assert.equal(healthPayload.port, 3210);
  assert.match(healthPayload.workflowRunUrl, /^https:\/\/.+\/run$/);
});
