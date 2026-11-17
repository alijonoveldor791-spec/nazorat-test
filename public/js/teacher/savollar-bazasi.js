// Maktab mavzulari, tanlanganlar, qoralamalar va tarifli umumiy tayyor testlar sahifasi.
import { bootstrapPage } from './shell.js';
import { esc } from '../core/dom.js';
import { call, post } from './teacher-api.js';
import { newTopic, inspectTopic } from './library-topics.js';
import { importTopic } from './library-import.js';
import { topicPrompt } from './library-prompt.js';
import { bindQuarterTotal } from './library-compose.js';
import { publishTest, downloadTest } from './library-actions.js';
import { libraryFrame as frame, libraryButton as button, selectedCard, savedCard } from './library-view.js';
import { confirmAction } from '../components/modal.js';
import { reviewDraft } from './library-compose.js';
import { renderTopicGroups, selectionTitle, orderedTests } from './library-order.js';
import { toast } from '../components/toast.js';
let topics = [],
  selected = new Set(),
  tests = [],
  shared = [],
  access = { permissions: {} };
const amounts = new Map();
let status = 0,
  page = 1;
let suggestedTitle = '';
function draw() {
  const grade = document.getElementById('filter-grade').value.toLowerCase().trim();
  const subject = document.getElementById('filter-subject').value.toLowerCase().trim();
  const quarter = document.getElementById('filter-quarter').value;
  const query = document.getElementById('filter-query').value.toLowerCase().trim();
  const visible = topics.filter(
    (t) =>
      (!grade || t.grade.toLowerCase() === grade) &&
      (!subject || t.subject.toLowerCase().includes(subject)) &&
      (!quarter || t.quarter === +quarter) &&
      t.name.toLowerCase().includes(query)
  );
  document.getElementById('library-topics').innerHTML =
    renderTopicGroups(visible, selected) || '<p class="library-empty">Mavzu topilmadi.</p>';
  document.getElementById('topic-count').textContent = visible.length + ' ta mavzu';
  document.getElementById('library-selected').innerHTML =
    topics
      .filter((t) => selected.has(t.id))
      .map((t) => selectedCard(t, amounts.get(t.id) ?? 1))
      .join('') || '<p class="library-empty">Test tuzish uchun mavzu tanlang.</p>';
  document.getElementById('selected-topics-count').textContent = selected.size + ' ta mavzu tanlandi';
  updateAmounts();
  const title = document.getElementById('library-title');
  const nextTitle = selectionTitle(topics.filter((t) => selected.has(t.id)));
  if (!title.value || title.value === suggestedTitle) title.value = nextTitle;
  suggestedTitle = nextTitle;
  document.getElementById('library-stats').innerHTML = [
    ['Jami baza', topics.reduce((n, t) => n + t.count, 0) + ' savol'],
    ['Saqlangan', tests.length + ' ta test'],
    ['Faol testlar', tests.filter((t) => t.active).length + ' ta'],
  ]
    .map(([label, value]) => `<div><small>${label}</small><b>${value}</b></div>`)
    .join('');
  document.getElementById('library-context').textContent =
    [grade && grade + '-sinf', subject, quarter && quarter + '-chorak'].filter(Boolean).join(' / ') ||
    'Maktab savollari / Barcha mavzular';
  const testQuery = document.getElementById('test-query').value.toLowerCase();
  const filtered = orderedTests(tests, topics).filter(
    (t) =>
      (t.title + ' ' + (t.testCode?.value || '')).toLowerCase().includes(testQuery) &&
      (!status || (status === 2 ? t.active : !t.active))
  );
  const size = +document.getElementById('library-page-size').value;
  const pages = Math.max(1, Math.ceil(filtered.length / size));
  page = Math.min(page, pages);
  document.getElementById('saved-count').textContent = filtered.length + ' ta test';
  document.getElementById('library-tests').innerHTML =
    filtered
      .slice((page - 1) * size, page * size)
      .map((t, i) => savedCard(t, (page - 1) * size + i, access.permissions))
      .join('') || '<p class="library-empty">Saqlangan test topilmadi.</p>';
  document.getElementById('library-page-info').textContent =
    `Ko'rsatilmoqda: ${filtered.length ? (page - 1) * size + 1 : 0}-${Math.min(page * size, filtered.length)} / ${filtered.length} ta test`;
  document.getElementById('library-page-number').textContent = page;
  document.querySelector('[data-library="previous"]').disabled = page === 1;
  document.querySelector('[data-library="next"]').disabled = page === pages;
  const bankQuery = document.getElementById('bank-query').value.toLowerCase();
  document.getElementById('library-bank').innerHTML = !access.permissions.view
    ? '<p>Tarifda umumiy bank yopiq.</p>'
    : shared
        .filter((t) => (t.title + ' ' + t.subject).toLowerCase().includes(bankQuery))
        .map(
          (
            t
          ) => `<article class="card"><h3>${esc(t.title)}</h3><p>${esc(t.subject)} / ${t.count} savol</p><div class="row">
    ${button('take', t.id, 'Testni olish', !access.permissions.take)}${button('bank-docx', t.id, 'Word yuklab olish', !access.permissions.docx)}
    ${button('bank-pdf', t.id, 'PDF yuklab olish', !access.permissions.pdf)}${button('bank-key', t.id, 'Javoblar kaliti', !access.permissions.key)}</div></article>`
        )
        .join('');
}
function updateAmounts() {
  const chosen = topics.filter((t) => selected.has(t.id));
  const total = chosen.reduce((sum, t) => sum + (amounts.get(t.id) ?? 1), 0);
  const valid =
    chosen.length &&
    total <= 200 &&
    chosen.every(
      (t) => Number.isInteger(amounts.get(t.id)) && amounts.get(t.id) >= 1 && amounts.get(t.id) <= t.count
    );
  document.getElementById('selected-total').textContent = total + ' savol';
  document.getElementById('library-amount-error').textContent =
    total > 200
      ? 'Jami 200 savoldan oshmasin.'
      : chosen.length && !valid
        ? 'Har mavzu uchun mavjud miqdorda butun son kiriting.'
        : '';
  document.getElementById('compose-topics').disabled = !valid;
  return valid;
}
async function reload() {
  [topics, tests, access] = await Promise.all([call('topics'), call('tests'), call('bank-access')]);
  shared = access.permissions.view ? await call('shared-tests') : [];
  for (const id of selected)
    if (!topics.some((t) => t.id === id)) {
      selected.delete(id);
      amounts.delete(id);
    }
  draw();
}
bindQuarterTotal();
if (await bootstrapPage('library', frame)) {
  document.querySelectorAll('[id^="filter-"], #bank-query, #test-query, #library-page-size').forEach((n) =>
    n.addEventListener('input', () => {
      page = 1;
      draw();
    })
  );
  document.getElementById('library-selected').addEventListener('input', (event) => {
    const id = event.target.dataset.libraryAmount;
    if (!id) return;
    amounts.set(id, +event.target.value);
    updateAmounts();
  });
  document.querySelectorAll('[data-test-status]').forEach((b) =>
    b.addEventListener('click', () => {
      status = +b.dataset.testStatus;
      page = 1;
      document
        .querySelectorAll('[data-test-status]')
        .forEach((n) => n.setAttribute('aria-pressed', String(n === b)));
      draw();
    })
  );
  document.addEventListener('click', async (event) => {
    const b = event.target.closest('[data-library]');
    if (!b || b.disabled) return;
    b.disabled = true;
    const id = b.dataset.id,
      action = b.dataset.library;
    try {
      if (action === 'previous' || action === 'next') {
        page += action === 'next' ? 1 : -1;
        draw();
      } else if (action === 'unselect') {
        selected.delete(id);
        amounts.delete(id);
        draw();
      } else if (action === 'increase' || action === 'decrease') {
        const t = topics.find((t) => t.id === id);
        amounts.set(
          id,
          Math.max(1, Math.min(t.count, 200, (amounts.get(id) || 1) + (action === 'increase' ? 1 : -1)))
        );
        draw();
        document
          .querySelector(`[data-library="${action}"][data-id="${CSS.escape(id)}"]`)
          ?.focus({ preventScroll: true });
      } else if (action === 'delete') {
        if (await confirmAction("Testni o'chirish", "Test o'chiriladi. Davom etasizmi?")) {
          await call('tests/' + id, { method: 'DELETE' });
          await reload();
        }
      } else if (action === 'select') {
        const first = topics.find((t) => selected.has(t.id)),
          next = topics.find((t) => t.id === id);
        if (first && ['grade', 'subject'].some((k) => first[k] !== next[k]))
          throw new Error("Bir sinf va fan mavzularini tanlang; choraklar turlicha bo'lishi mumkin.");
        selected.add(id);
        amounts.set(id, Math.min(10, next.count));
        draw();
      } else if (action === 'new') {
        await newTopic();
        await reload();
      } else if (action === 'reload') await reload();
      else if (action === 'prompt') await topicPrompt(topics.find((t) => t.id === id));
      else if (action === 'inspect') {
        await inspectTopic(id);
        await reload();
      } else if (action === 'upload') {
        await importTopic(id);
        await reload();
      } else if (action === 'compose') {
        if (!updateAmounts()) return;
        const draft = await post('quarter/compose', {
          topics: [...selected].map((id) => ({ id, count: amounts.get(id) || 1 })),
        });
        draft.title = document.getElementById('library-title').value.trim() || draft.title;
        await reviewDraft(draft);
        await reload();
      } else if (action === 'publish') {
        await publishTest(id);
        await reload();
      } else if (action === 'share') {
        await post(`tests/${id}/share`);
        toast("Ko'rib chiqishga yuborildi.");
      } else if (action === 'take') {
        await post(`shared-tests/${id}/take`);
        await reload();
      } else if (action.startsWith('bank-')) await downloadTest(id, action.slice(5), true);
      else await downloadTest(id, action);
    } catch (error) {
      toast(error.message, true);
    } finally {
      if (b.isConnected && !['previous', 'next'].includes(action)) {
        b.disabled = false;
        updateAmounts();
      }
    }
  });
  try {
    await reload();
  } catch (error) {
    toast(error.message, true);
  }
}
