// Bosh adminning tarif/maktab istisnolari va tayyor test moderatsiyasi interfeysi.
import { api } from '../core/api-client.js';
import { getToken } from '../core/auth.js';
import { esc } from '../core/dom.js';
import { modal } from '../components/modal.js';
import { renderContent } from '../core/content-renderer.js';
import { renderMath } from '../core/math-renderer.js';
const ACTIONS = {
  view: "Umumiy bankni ko'rish",
  take: 'Testni olib onlayn ishlatish',
  docx: 'DOCX yuklab olish',
  pdf: 'PDF yuklab olish',
  key: 'Javoblar kaliti',
  rerunExpired: "Tarif tugagach qayta o'tkazish",
};
const call = (path, method = 'GET', body) =>
  api('super-admin/' + path, {
    token: getToken(),
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
let queue = [],
  policies = [];
const rulesHost = document.getElementById('policy-rules');
rulesHost.innerHTML = Object.entries(ACTIONS)
  .map(
    ([key, label]) => `<label>${label}<select data-rule="${key}">
  <option value="">Tarifdan</option><option value="true">Ruxsat</option><option value="false">Yopiq</option></select></label>`
  )
  .join('');
async function reload() {
  [queue, policies] = await Promise.all([call('shared-tests'), call('bank-policies')]);
  document.getElementById('saved-policies').innerHTML = policies
    .map((p) => `<p><button class="btn secondary" data-load-policy="${esc(p.id)}">${esc(p.id)}</button></p>`)
    .join('');
  document.getElementById('bank-review').innerHTML =
    queue
      .map(
        (t) => `<article class="card"><h3>${esc(t.title)}</h3>
    <p>${esc(t.subject)} / ${t.questions.length} savol / ${esc(t.status)}</p><button class="btn" data-review="${esc(t.id)}">Ko'rib chiqish</button></article>`
      )
      .join('') || "<p>Yuborilgan test yo'q.</p>";
}
async function execute(action) {
  try {
    await action();
    document.getElementById('bank-status').textContent = 'Tayyor.';
  } catch (error) {
    document.getElementById('bank-status').textContent = error.message;
    if (error.status === 401) location.assign('/oqituvchi/kirish.html');
  }
}
document.getElementById('bank-policy').addEventListener('submit', (event) => {
  event.preventDefault();
  const button = event.submitter;
  button.disabled = true;
  execute(async () => {
    const rules = {};
    rulesHost.querySelectorAll('[data-rule]').forEach((n) => {
      if (n.value) rules[n.dataset.rule] = n.value === 'true';
    });
    await call('bank-policies', 'PUT', {
      type: document.getElementById('policy-type').value,
      target: document.getElementById('policy-target').value,
      tariffId: document.getElementById('policy-tariff').value,
      rules,
    });
    await reload();
  }).finally(() => {
    button.disabled = false;
  });
});
document.addEventListener('click', (event) => {
  const load = event.target.closest('[data-load-policy]');
  if (load) {
    const p = policies.find((p) => p.id === load.dataset.loadPolicy);
    document.getElementById('policy-type').value = p.type;
    document.getElementById('policy-target').value = p.target;
    document.getElementById('policy-tariff').value = p.tariffId;
    rulesHost.querySelectorAll('[data-rule]').forEach((n) => {
      n.value = p.rules[n.dataset.rule] === undefined ? '' : String(p.rules[n.dataset.rule]);
    });
  }
  const review = event.target.closest('[data-review]');
  if (!review) return;
  execute(async () => {
    const t = queue.find((t) => t.id === review.dataset.review);
    const pending = modal(
      "Tayyor testni ko'rib chiqish",
      `<form class="stack">
      <label>Holat<select id="review-state"><option value="approved">Tasdiqlash</option><option value="rejected">Rad etish</option></select></label>
      <label>Tarif IDlari (vergul bilan)<input id="review-tariffs" value="${esc(t.tariffIds.join(', '))}"></label>
      <label>Maktab ichki IDlari (vergul bilan)<textarea id="review-schools">${esc(t.schoolIds.join(', '))}</textarea></label></form>
      ${t.questions.map((q, i) => `<article class="question-editor"><b>${i + 1}.</b>${renderContent(q.q, q.contentFormat)}${q.options.map((o, j) => `<div>${q.answer === j ? "To'g'ri: " : ''}${'ABCDEF'[j]}. ${renderContent(o, q.contentFormat)}</div>`).join('')}</article>`).join('')}`,
      {
        onConfirm: async (d) => {
          const ids = (selector) =>
            d
              .querySelector(selector)
              .value.split(',')
              .map((v) => v.trim())
              .filter(Boolean);
          await call('shared-tests/' + t.id, 'PUT', {
            status: d.querySelector('#review-state').value,
            tariffIds: ids('#review-tariffs'),
            schoolIds: ids('#review-schools'),
          });
        },
      }
    );
    renderMath(document.querySelector('dialog'));
    await pending;
    await reload();
  });
});
await execute(reload);
