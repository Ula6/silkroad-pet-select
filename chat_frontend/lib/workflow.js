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

function buildWorkflowPayload(slots) {
  return {
    target_market: slots.target_market,
    budget: slots.budget,
    risk_preference: slots.risk_preference,
    product_direction: slots.product_direction,
  };
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

function shouldReuseSlots(sessionState, message) {
  const phase = sessionState?.phase || 'idle';
  const content = String(message || '').trim();

  if (phase === 'followup') {
    return true;
  }

  if (phase === 'report') {
    return /^(把刚才|将刚才|在刚才基础上|沿用刚才|继续刚才|继续补充|补充刚才|改成|改为|调整为|换成)/.test(
      content
    );
  }

  return false;
}

function safeArray(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatListPreview(items, limit) {
  return items.slice(0, limit).map((item, index) => {
    const rank = item.rank || index + 1;
    const name =
      item.product_name ||
      item.title_en ||
      item.product?.title_en ||
      item.product?.product_name ||
      '未命名单品';
    const reason =
      item.ranking_reason ||
      item.recommendation_reason ||
      item.reason ||
      item.summary ||
      '';

    return { rank, name, reason };
  });
}

function formatAssistantSections(result) {
  const top10 = safeArray(result.top10_summary || result.top10_list);
  const focusProducts = safeArray(result.focus_products || result.top3_analysis);
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
    heroTitle: result.summary_title || '丝路宠选选品报告',
    outputStyle: result.output_style || 'business_report_cn',
    sections,
    raw: result,
  };
}

module.exports = {
  extractSlots,
  getMissingFields,
  buildWorkflowPayload,
  buildFollowupMessage,
  formatAssistantSections,
  shouldReuseSlots,
};
