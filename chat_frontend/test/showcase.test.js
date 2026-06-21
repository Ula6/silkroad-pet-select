const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const indexHtml = fs.readFileSync(
  path.join(projectRoot, 'public', 'index.html'),
  'utf8'
);
const appScript = fs.readFileSync(
  path.join(projectRoot, 'public', 'app.js'),
  'utf8'
);
const stylesCss = fs.readFileSync(
  path.join(projectRoot, 'public', 'styles.css'),
  'utf8'
);

test('homepage locks the task 1 showcase contract', () => {
  const requiredHomepageSnippets = [
    '10 秒生成跨境宠物用品 Top 10 选品方案',
    '基于海外评论、商品评分、利润规则与江苏供应链模拟库。',
    'id="startDemoBtn"',
    'id="freeInputBtn"',
    'Top 10 选品清单',
    '可改良利润机会',
    '江苏供应链承接路径',
    '从需求到上架建议，形成一条完整选品链路',
    '示例选品报告',
  ];

  const requiredAppSnippets = [
    'startDemoBtn',
    'freeInputBtn',
    'scrollIntoView',
    'focus(',
    'const defaultDemoMessage =',
    '我想做美国市场的宠物玩具，预算10到20万，偏稳健一点。',
  ];

  requiredHomepageSnippets.forEach((snippet) => {
    assert.match(indexHtml, new RegExp(escapeRegExp(snippet)));
  });

  requiredAppSnippets.forEach((snippet) => {
    assert.match(appScript, new RegExp(escapeRegExp(snippet)));
  });

  assert.equal(appScript.includes("document.querySelector('.quick-btn')"), false);
});

test('homepage locks the task 2 structure order and report placement', () => {
  const heroIndex = indexHtml.indexOf('data-section="hero-value"');
  const resultCardsIndex = indexHtml.indexOf('data-section="result-cards"');
  const entryActionsIndex = indexHtml.indexOf('data-section="entry-actions"');
  const capabilityChainIndex = indexHtml.indexOf('data-section="capability-chain"');
  const reportShowcaseIndex = indexHtml.indexOf('data-section="report-showcase"');
  const demoCardIndex = indexHtml.indexOf('data-preview="demo-card"');
  const chatIndex = indexHtml.indexOf('id="chat"');
  const composerIndex = indexHtml.indexOf('id="composer"');

  assert.notEqual(heroIndex, -1);
  assert.notEqual(resultCardsIndex, -1);
  assert.notEqual(entryActionsIndex, -1);
  assert.notEqual(capabilityChainIndex, -1);
  assert.notEqual(reportShowcaseIndex, -1);
  assert.notEqual(demoCardIndex, -1);
  assert.notEqual(chatIndex, -1);
  assert.notEqual(composerIndex, -1);

  assert.equal(heroIndex < resultCardsIndex, true);
  assert.equal(resultCardsIndex < entryActionsIndex, true);
  assert.equal(entryActionsIndex < capabilityChainIndex, true);
  assert.equal(capabilityChainIndex < reportShowcaseIndex, true);
  assert.equal(chatIndex > reportShowcaseIndex, true);
  assert.equal(composerIndex > reportShowcaseIndex, true);

  assert.equal(indexHtml.includes('class="intro-card" data-section="capability-chain"'), false);
  assert.equal(indexHtml.includes('class="intro-card" data-section="report-showcase"'), false);
});

test('homepage locks the task 3 commercial saas css contract', () => {
  const requiredLiveCssSelectors = [
    'hero[data-section="hero-value"]',
    '[data-preview="demo-card"]',
    '.intro-grid[data-section="result-cards"]',
    '.intro-grid[data-section="entry-actions"]',
    '.capability-section[data-section="capability-chain"]',
    '.report-showcase-section[data-section="report-showcase"]',
    '.entry-card-primary',
  ];

  requiredLiveCssSelectors.forEach((snippet) => {
    assert.match(stylesCss, new RegExp(escapeRegExp(snippet)));
  });

  assert.match(indexHtml, /class="intro-card entry-card-primary"/);
});

test('homepage locks the task 4 demo-first interaction flow', () => {
  const requiredAppFlowSnippets = [
    'const defaultDemoMessage =',
    'startDemoBtn?.addEventListener',
    'freeInputBtn?.addEventListener',
    'data-section="report-showcase"',
    "scrollIntoView({ behavior: 'smooth'",
  ];

  requiredAppFlowSnippets.forEach((snippet) => {
    assert.match(appScript, new RegExp(escapeRegExp(snippet)));
  });

  assert.match(
    indexHtml,
    /答辩时建议先运行稳定演示，再切换到自由输入体验。/
  );
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
