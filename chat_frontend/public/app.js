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

const NETWORK_TIMEOUT_MS = 8000;

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

function resetRound(withNotice = false) {
  state.slots = {};
  state.phase = 'idle';

  if (withNotice) {
    addMessage(
      'assistant',
      '已为你开启新一轮分析。请直接输入新的目标市场、预算范围、风险偏好和产品方向。'
    );
  }
}

function jumpToReportArea() {
  reportShowcaseEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

async function fetchWithTimeout(url, options = {}, timeoutMs = NETWORK_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    window.clearTimeout(timer);
  }
}

function escapeHtml(text) {
  return text
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

async function refreshMode() {
  const response = await fetchWithTimeout('/api/health');
  const data = await response.json();
  modeBadgeEl.textContent = data.modeLabel;
  modeDescEl.textContent = data.modeDescription;
  modeEndpointEl.textContent =
    data.mode === 'live'
      ? '已连接 Coze 已部署工作流'
      : data.runtimeTarget === 'vercel'
        ? '当前为公网演示模式'
        : '当前为本地演示模式';
  networkHintEl.textContent = data.networkHint || '当前访问范围信息暂不可用';
}

async function sendMessage(message) {
  sendBtn.disabled = true;
  addMessage('user', message);
  const reuseSlots = shouldReuseCurrentSlots(message);
  const slotsToSend = reuseSlots ? state.slots : {};

  if (!reuseSlots) {
    state.slots = {};
    state.phase = 'idle';
  }

  try {
    const response = await fetchWithTimeout('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        slots: slotsToSend,
      }),
    });

    const data = await response.json();
    state.slots = data.slots || {};
    state.phase = data.phase || 'idle';

    addMessage(data.role || 'assistant', data.message, data.sections || []);
  } catch (error) {
    state.phase = 'error';
    addMessage(
      'assistant',
      '当前公网接口响应较慢，已切回稳定演示方式。你可以先点击“开始智能选品演示”，或稍后再试自由输入。'
    );
  } finally {
    sendBtn.disabled = false;
  }
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = inputEl.value.trim();
  if (!message) return;

  inputEl.value = '';
  await sendMessage(message);
});

document.querySelectorAll('.quick-btn').forEach((button) => {
  button.addEventListener('click', async () => {
    resetRound();
    const message = button.dataset.message;
    await sendMessage(message);
  });
});

resetBtn.addEventListener('click', () => {
  resetRound(true);
});

startDemoBtn?.addEventListener('click', async () => {
  resetRound();
  await sendMessage(defaultDemoMessage);
  jumpToReportArea();
});

freeInputBtn?.addEventListener('click', () => {
  formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  inputEl.focus();
});

addMessage(
  'assistant',
  '欢迎来到丝路宠选。你可以直接用一句话告诉我目标市场、预算范围、风险偏好和产品方向，我会把它整理成适合演示、汇报和答辩展示的选品结论。'
);

refreshMode().catch(() => {
  modeBadgeEl.textContent = '状态未知';
  modeDescEl.textContent = '接口状态检查失败，但你仍然可以进入演示模式。';
  modeEndpointEl.textContent = '未获取到运行状态';
  networkHintEl.textContent = '请检查服务是否已经启动';
});
