const chatEl = document.getElementById('chat');
const formEl = document.getElementById('composer');
const inputEl = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const resetBtn = document.getElementById('resetBtn');
const startDemoBtn = document.getElementById('startDemoBtn');
const freeInputBtn = document.getElementById('freeInputBtn');
const modeBadgeEl = document.getElementById('modeBadge');
const modeDescEl = document.getElementById('modeDesc');
const modeEndpointEl = document.getElementById('modeEndpoint');
const networkHintEl = document.getElementById('networkHint');
const template = document.getElementById('messageTemplate');
const reportShowcaseEl = document.querySelector(
  '[data-section="report-showcase"]'
);

const defaultDemoMessage =
  '我想做美国市场的宠物玩具，预算10到20万，偏稳健一点。';

const state = {
  slots: {},
  phase: 'idle',
};

const FIELD_ORDER = [
  'target_market',
  'budget',
  'risk_preference',
  'product_direction',
];

const FIELD_LABELS = {
  target_market: '目标市场',
  budget: '预算范围',
  risk_preference: '风险偏好',
  product_direction: '产品方向',
};

const MARKET_KEYWORDS = [
  '美国',
  '英国',
  '德国',
  '法国',
  '欧洲',
  '日本',
  '韩国',
  '东南亚',
  '马来西亚',
  '新加坡',
  '中东',
];

const RISK_KEYWORDS = ['保守', '稳健', '激进'];

const DIRECTION_KEYWORDS = [
  '宠物玩具',
  '猫咪用品',
  '宠物清洁用品',
  '猫爬架',
  '智能喂食器',
  '宠物饮水机',
  '宠物窝',
  '牵引绳',
  '胸背带',
  '宠物清洁',
  '猫砂垫',
  '宠物梳刷',
];

const DEMO_RESULTS = {
  default: {
    summary_title: '丝路宠选选品报告',
    output_style: 'business_report_cn',
    demand_summary:
      '本轮需求以宠物用品跨境测试上架为目标，建议优先聚焦轻小件、评论基础充分、可由江苏供应链快速承接的单品方向，并通过小规模并行测款控制试错成本。',
    top10_summary: [
      {
        rank: 1,
        product_name: 'Interactive Dog Chew Toy',
        ranking_reason: '互动属性强，适合作为首轮测试流量款。',
      },
      {
        rank: 2,
        product_name: 'Cat Teaser Wand Set',
        ranking_reason: '具备组合装潜力，适合内容化展示。',
      },
      {
        rank: 3,
        product_name: 'Slow Feeder Puzzle Bowl',
        ranking_reason: '痛点清晰，适合通过细节优化提升转化。',
      },
    ],
    focus_products: [
      {
        rank: 1,
        product_name: 'Interactive Dog Chew Toy',
        summary: '适合走耐用性与互动性双卖点路线。',
      },
      {
        rank: 2,
        product_name: 'Cat Teaser Wand Set',
        summary: '适合礼盒化和替换件扩展。',
      },
      {
        rank: 3,
        product_name: 'Slow Feeder Puzzle Bowl',
        summary: '适合围绕慢食和减压场景做内容营销。',
      },
    ],
    business_report_md:
      '丝路宠选选品报告\n\n一、需求摘要\n当前任务适合采用轻小件优先、场景痛点优先的测款策略，先用少量SKU验证点击率、收藏率和评论反馈，再决定是否放大备货。\n\n二、Top10推荐概览\n候选商品主要集中在互动玩具、喂食辅助与基础清洁类，这些品类既有稳定需求，也更容易通过包装、材质和组合方式形成差异化。\n\n三、前3重点单品结论\n1. Interactive Dog Chew Toy：适合承担首轮引流任务，重点看耐咬和互动表现。\n2. Cat Teaser Wand Set：适合做内容展示和多SKU组合。\n3. Slow Feeder Puzzle Bowl：适合围绕慢食和解闷场景进行内容教育。\n\n四、运营建议\n建议先做2-3款并行测试，以低库存、快反馈方式验证市场，再根据转化与评论关键词决定扩品方向。',
  },
  us_toy: {
    summary_title: '丝路宠选选品报告',
    output_style: 'business_report_cn',
    demand_summary:
      '本次需求聚焦美国市场，预算区间为10-20万，风险偏好以稳健为主，优先关注宠物玩具方向。整体策略建议优先选择轻小件、评价基数充足、可通过材质升级和结构优化形成差异化的宠物用品。',
    top10_summary: [
      {
        rank: 1,
        product_name: 'Interactive Dog Chew Toy',
        ranking_reason: '轻小件、评价基数高，适合美国市场稳健测款。',
      },
      {
        rank: 2,
        product_name: 'Cat Teaser Wand Set',
        ranking_reason: '复购潜力较好，适合做多SKU组合。',
      },
      {
        rank: 3,
        product_name: 'Slow Feeder Puzzle Bowl',
        ranking_reason: '痛点明确，可通过材质与包装升级提升转化。',
      },
    ],
    focus_products: [
      {
        rank: 1,
        product_name: 'Interactive Dog Chew Toy',
        summary: '适合作为首轮测款单品，重点在耐咬材质和包装视觉升级。',
      },
      {
        rank: 2,
        product_name: 'Cat Teaser Wand Set',
        summary: '适合组合装打法，重点提升配件耐用性与套装价值感。',
      },
      {
        rank: 3,
        product_name: 'Slow Feeder Puzzle Bowl',
        summary: '适合围绕喂食场景做内容营销，突出减缓进食和清洁便利性。',
      },
    ],
    business_report_md:
      '丝路宠选选品报告\n\n一、需求摘要\n本轮选品需求面向美国市场，预算区间为10-20万，整体偏稳健，重点关注宠物玩具方向。建议优先选择轻小件、低合规压力、评价基础成熟且便于江苏供应链快速承接的产品。\n\n二、Top10推荐概览\n当前候选结果主要集中在互动玩具、猫咪逗玩组件和喂食辅助用品三类。其中互动型宠物玩具具备更好的测款效率，既适合通过短视频内容放大卖点，也便于通过材质升级、颜色组合和包装优化拉开差异。\n\n三、前3重点单品结论\n1. Interactive Dog Chew Toy：适合作为首轮测款核心单品，需求稳定，结构简单，便于江苏供应链快速打样。建议重点优化耐咬表现与清洁便利性。\n2. Cat Teaser Wand Set：适合走组合装与礼盒化路线，具备较强的内容展示性。建议强化配件质量和替换装逻辑，提高客单价与复购空间。\n3. Slow Feeder Puzzle Bowl：具备明确用户痛点，适合围绕慢食、解闷、减压等场景进行内容营销。建议在材质安全和防滑细节上做升级。\n\n四、运营建议\n首轮建议以2-3款轻小件做并行测款，优先验证点击率、收藏率和评论关键词反馈。广告策略以短视频种草和场景化图文为主，重点观察“耐用”“互动性”“清洁便利”三类反馈标签，再决定是否进行组合装扩品。',
  },
  sea_clean: {
    summary_title: '丝路宠选选品报告',
    output_style: 'business_report_cn',
    demand_summary:
      '本次需求面向东南亚市场，预算区间为5-10万，风险偏好以保守为主，产品方向聚焦宠物清洁用品。建议优先筛选轻便、防漏、防潮、物流友好的基础清洁类单品，以提高上架效率和跨境运输稳定性。',
    top10_summary: [
      {
        rank: 1,
        product_name: 'Pet Paw Cleaning Cup',
        ranking_reason: '体积小、物流友好，适合东南亚市场快速测试。',
      },
      {
        rank: 2,
        product_name: 'Silicone Litter Mat',
        ranking_reason: '场景明确，适合做低门槛引流款。',
      },
      {
        rank: 3,
        product_name: 'Portable Pet Waste Bag Holder',
        ranking_reason: '轻小件、低风险，适合作为组合配件销售。',
      },
    ],
    focus_products: [
      {
        rank: 1,
        product_name: 'Pet Paw Cleaning Cup',
        summary: '适合做首轮测试单品，重点在密封性、易清洗和材质安全。',
      },
      {
        rank: 2,
        product_name: 'Silicone Litter Mat',
        summary: '适合围绕防带砂、易冲洗、颜色组合做差异化。',
      },
      {
        rank: 3,
        product_name: 'Portable Pet Waste Bag Holder',
        summary: '适合组合销售，重点强化便携性和日常遛宠场景。',
      },
    ],
    business_report_md:
      '丝路宠选选品报告\n\n一、需求摘要\n本轮需求以东南亚市场为主，预算控制在5-10万，整体偏保守，重点关注宠物清洁用品。建议优先选择运输稳定、材质安全、功能表达清晰的基础清洁类单品。\n\n二、Top10推荐概览\n当前更适合优先测试的是足部清洁、猫砂清洁和出行清洁配件三类产品。这些产品普遍客单价适中、物流压力较小，更适合以快速上架和低风险验证为目标的市场切入策略。\n\n三、前3重点单品结论\n1. Pet Paw Cleaning Cup：适合承担首轮测试任务，卖点清晰，用户教育成本低。建议重点优化密封防漏与硅胶刷头体验。\n2. Silicone Litter Mat：场景刚需明确，适合通过尺寸分层和颜色组合放大SKU选择空间。\n3. Portable Pet Waste Bag Holder：适合作为低门槛配件款，与牵引绳、外出包等用品形成搭售。\n\n四、运营建议\n建议先做基础款快速试水，优先关注物流破损率、用户对材质气味和清洗便利性的反馈，再决定是否做升级款或套装化延展。',
  },
  cat_profit: {
    summary_title: '丝路宠选选品报告',
    output_style: 'business_report_cn',
    demand_summary:
      '本次需求聚焦猫咪用品方向，预算约15万，整体偏稳健，目标是寻找可改良、利润空间更好的候选商品。建议优先选择评价样本充足、差评集中、容易通过材质、结构或包装优化形成差异的细分产品。',
    top10_summary: [
      {
        rank: 1,
        product_name: 'Cat Teaser Wand Set',
        ranking_reason: '改良点明确，适合通过套装设计与配件升级提升利润。',
      },
      {
        rank: 2,
        product_name: 'Foldable Cat Tunnel',
        ranking_reason: '内容展示性强，适合做视觉升级和多件组合。',
      },
      {
        rank: 3,
        product_name: 'Silicone Lick Mat for Cats',
        ranking_reason: '痛点集中，易通过吸附结构和包装升级提升客单。',
      },
    ],
    focus_products: [
      {
        rank: 1,
        product_name: 'Cat Teaser Wand Set',
        summary: '适合通过耐用替换头、礼盒感包装和套装组合拉高利润。',
      },
      {
        rank: 2,
        product_name: 'Foldable Cat Tunnel',
        summary: '适合围绕收纳便利性和面料耐抓性进行升级。',
      },
      {
        rank: 3,
        product_name: 'Silicone Lick Mat for Cats',
        summary: '适合强化吸附稳定性和喂食场景价值，形成差异化。',
      },
    ],
    business_report_md:
      '丝路宠选选品报告\n\n一、需求摘要\n本轮需求以猫咪用品为核心，预算约15万，整体偏稳健，重点在于寻找可通过结构、材质或包装优化获得更高利润空间的产品。建议优先筛选差评集中、改良逻辑清晰、供应链容易打样的细分单品。\n\n二、Top10推荐概览\n当前更有潜力的方向集中在互动逗猫、家居娱乐和喂食辅助三类产品。这些品类具备较好的内容表现力，也更适合通过替换件、组合装和外观升级形成更高客单和更清晰的利润空间。\n\n三、前3重点单品结论\n1. Cat Teaser Wand Set：改良空间最明确，适合做套装化与替换件延展。建议把重点放在耐用性和礼盒化包装。\n2. Foldable Cat Tunnel：适合作为视觉主图型产品，重点优化收纳结构与面料耐抓性。\n3. Silicone Lick Mat for Cats：适合强化吸附力与喂食场景价值，通过包装说明和场景化内容提升转化。\n\n四、运营建议\n建议先围绕“差评可改良”做样品验证，把高频问题转化为新卖点，再通过组合装和升级款拉升利润水平，避免单纯价格竞争。',
  },
};

function normalizeBudget(text) {
  const compact = text.replace(/\s+/g, '');
  const rangeMatch = compact.match(/(\d+(?:\.\d+)?)[到\-~至](\d+(?:\.\d+)?)(万|w|W)?/);
  if (rangeMatch) {
    const unit = rangeMatch[3] ? '万' : '';
    return `${rangeMatch[1]}-${rangeMatch[2]}${unit}`;
  }

  const singleMatch = compact.match(/预算(?:大概|约|在)?(\d+(?:\.\d+)?)(万|w|W)?/);
  if (singleMatch) {
    return `${singleMatch[1]}${singleMatch[2] ? '万' : ''}`;
  }

  return '';
}

function extractDirection(message) {
  for (const keyword of DIRECTION_KEYWORDS) {
    if (message.includes(keyword)) {
      return keyword;
    }
  }

  const directMatch = message.match(
    /(?:做|看|选|做的是|产品方向|方向|品类)(?:一些|一类|偏)?([^\n，。,；;]{2,18})/
  );
  if (directMatch) {
    return directMatch[1]
      .replace(/^(美国|英国|德国|法国|欧洲|日本|韩国|东南亚|马来西亚|新加坡)市场的?/, '')
      .replace(/^宠物用品/, '')
      .trim();
  }

  return '';
}

function mergeSlots(base, incoming) {
  return {
    target_market: incoming.target_market || base.target_market || '',
    budget: incoming.budget || base.budget || '',
    risk_preference: incoming.risk_preference || base.risk_preference || '',
    product_direction: incoming.product_direction || base.product_direction || '',
  };
}

function extractSlots(message, existingSlots = {}) {
  const extracted = {
    target_market: '',
    budget: '',
    risk_preference: '',
    product_direction: '',
  };

  for (const market of MARKET_KEYWORDS) {
    if (message.includes(market)) {
      extracted.target_market = market;
      break;
    }
  }

  extracted.budget = normalizeBudget(message);

  for (const risk of RISK_KEYWORDS) {
    if (message.includes(risk)) {
      extracted.risk_preference = risk;
      break;
    }
  }

  extracted.product_direction = extractDirection(message);

  return mergeSlots(existingSlots, extracted);
}

function getMissingFields(slots) {
  return FIELD_ORDER.filter((field) => !slots[field]);
}

function buildFollowupMessage(slots) {
  const missing = getMissingFields(slots);
  if (!missing.length) {
    return '信息已收齐，我来为你生成选品建议。';
  }

  if (missing.length === 4) {
    return '请告诉我目标市场、预算范围、风险偏好和产品方向，我就能开始生成选品建议。';
  }

  return `还差 ${missing.map((field) => FIELD_LABELS[field]).join('、')}。你可以直接一句话补充给我。`;
}

function shouldReuseCurrentSlots(message) {
  const content = String(message || '').trim();

  if (state.phase === 'followup') {
    return true;
  }

  if (state.phase === 'report') {
    return /^(把刚才|将刚才|在刚才基础上|沿用刚才|继续刚才|继续补充|补充刚才|改成|改为|调整为|换成)/.test(
      content
    );
  }

  return false;
}

function formatListPreview(items, limit) {
  return items.slice(0, limit).map((item, index) => {
    const rank = item.rank || index + 1;
    const name = item.product_name || '未命名单品';
    const reason = item.ranking_reason || item.reason || item.summary || '';
    return { rank, name, reason };
  });
}

function formatAssistantSections(result) {
  const top10 = Array.isArray(result.top10_summary) ? result.top10_summary : [];
  const focusProducts = Array.isArray(result.focus_products) ? result.focus_products : [];
  const sections = [];
  const topNames = formatListPreview(top10, 3).map((item) => item.name).join(' / ');
  const focusNames = formatListPreview(focusProducts, 1).map((item) => item.name).join('');

  sections.push({
    type: 'board',
    title: '选品结论速览',
    items: [],
    metrics: [
      {
        label: '报告标题',
        value: result.summary_title || '丝路宠选选品报告',
      },
      {
        label: '优先方向',
        value: topNames || '等待生成结果',
      },
      {
        label: '首推单品',
        value: focusNames || '等待生成结果',
      },
    ],
  });

  if (result.business_report_md) {
    sections.push({
      type: 'report',
      title: result.summary_title || '业务汇报正文',
      content: result.business_report_md,
    });
  }

  if (result.demand_summary) {
    sections.push({
      type: 'summary',
      title: '需求摘要',
      content: result.demand_summary,
    });
  }

  if (top10.length) {
    sections.push({
      type: 'top10',
      title: 'Top10推荐概览',
      items: formatListPreview(top10, 10),
    });
  }

  if (focusProducts.length) {
    sections.push({
      type: 'focus',
      title: '前3重点单品',
      items: formatListPreview(focusProducts, 3),
    });
  }

  return {
    sections,
  };
}

function pickScenarioResult(payload) {
  const market = payload.target_market || '';
  const direction = payload.product_direction || '';
  const risk = payload.risk_preference || '';

  if (market.includes('美国') && direction.includes('宠物玩具')) {
    return DEMO_RESULTS.us_toy;
  }

  if (
    (market.includes('东南亚') || market.includes('马来西亚') || market.includes('新加坡')) &&
    (direction.includes('清洁') || direction.includes('猫砂') || direction.includes('清洗'))
  ) {
    return DEMO_RESULTS.sea_clean;
  }

  if (
    (direction.includes('猫') || direction.includes('猫咪')) &&
    (direction.includes('利润') || risk.includes('稳健'))
  ) {
    return DEMO_RESULTS.cat_profit;
  }

  return DEMO_RESULTS.default;
}

function jumpToReportArea() {
  reportShowcaseEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function escapeHtml(text) {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function addMessage(role, content, sections = []) {
  const fragment = template.content.cloneNode(true);
  const messageEl = fragment.querySelector('.message');
  const avatarEl = fragment.querySelector('.avatar');
  const bubbleEl = fragment.querySelector('.bubble');

  messageEl.classList.toggle('user', role === 'user');
  avatarEl.textContent = role === 'user' ? '你' : 'AI';
  bubbleEl.innerHTML = `<p>${escapeHtml(content)}</p>`;

  sections.forEach((section) => {
    const card = document.createElement('div');
    card.className = 'section-card';

    if (section.type === 'report' || section.type === 'summary') {
      card.innerHTML = `<h3>${escapeHtml(section.title)}</h3><pre>${escapeHtml(section.content)}</pre>`;
    } else if (Array.isArray(section.items)) {
      if (section.type === 'board' && Array.isArray(section.metrics)) {
        card.classList.add('result-board');
        const metricsHtml = section.metrics
          .map(
            (metric) => `
              <div class="insight-item">
                <strong>${escapeHtml(metric.label)}</strong>
                <span>${escapeHtml(metric.value)}</span>
              </div>
            `
          )
          .join('');
        card.innerHTML = `<h3>${escapeHtml(section.title)}</h3><div class="insight-grid">${metricsHtml}</div>`;
        bubbleEl.appendChild(card);
        return;
      }

      const itemsHtml = section.items
        .map(
          (item) => `
            <div class="list-item">
              <div class="list-rank">#${item.rank} ${escapeHtml(item.name)}</div>
              <p>${escapeHtml(item.reason || '暂无补充说明')}</p>
            </div>
          `
        )
        .join('');
      card.innerHTML = `<h3>${escapeHtml(section.title)}</h3>${itemsHtml}`;
    }

    bubbleEl.appendChild(card);
  });

  chatEl.appendChild(fragment);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function resetRound(withNotice = false) {
  state.slots = {};
  state.phase = 'idle';
  chatEl.innerHTML = '';
  renderWelcome();

  if (withNotice) {
    addMessage(
      'assistant',
      '已为你开启新一轮分析。请直接输入新的目标市场、预算范围、风险偏好和产品方向。'
    );
  }
}

function renderWelcome() {
  addMessage(
    'assistant',
    '欢迎来到丝路宠选。你可以直接用一句话告诉我目标市场、预算范围、风险偏好和产品方向，我会把它整理成适合演示、汇报和答辩展示的选品结论。'
  );
}

function renderScenarioReply(message) {
  const reuseSlots = shouldReuseCurrentSlots(message);
  const slotsToSend = reuseSlots ? state.slots : {};

  if (!reuseSlots) {
    state.slots = {};
    state.phase = 'idle';
  }

  const mergedSlots = extractSlots(message, slotsToSend);
  const missing = getMissingFields(mergedSlots);

  if (missing.length) {
    state.slots = mergedSlots;
    state.phase = 'followup';
    addMessage('assistant', buildFollowupMessage(mergedSlots));
    return;
  }

  state.slots = mergedSlots;
  state.phase = 'report';
  const result = pickScenarioResult(mergedSlots);
  const formatted = formatAssistantSections(result);

  addMessage(
    'assistant',
    '我已经根据你的需求完成了一轮选品分析，下面是可直接展示的业务化结果。',
    formatted.sections
  );
}

function setStaticMode() {
  modeBadgeEl.textContent = '演示模式';
  modeDescEl.textContent = '当前页面为纯静态答辩版，不依赖外部接口，可直接跨设备展示。';
  modeEndpointEl.textContent = '内置演示数据';
  networkHintEl.textContent = '任意静态托管地址均可访问';
}

formEl.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = inputEl.value.trim();
  if (!message) return;

  inputEl.value = '';
  addMessage('user', message);
  renderScenarioReply(message);
});

document.querySelectorAll('.quick-btn').forEach((button) => {
  button.addEventListener('click', () => {
    resetRound();
    const message = button.dataset.message;
    addMessage('user', message);
    renderScenarioReply(message);
    jumpToReportArea();
  });
});

resetBtn.addEventListener('click', () => {
  resetRound(true);
});

startDemoBtn?.addEventListener('click', () => {
  resetRound();
  addMessage('user', defaultDemoMessage);
  renderScenarioReply(defaultDemoMessage);
  jumpToReportArea();
});

freeInputBtn?.addEventListener('click', () => {
  formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  inputEl.focus();
});

setStaticMode();
renderWelcome();
