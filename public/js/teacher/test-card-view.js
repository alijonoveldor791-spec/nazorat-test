// Test kartasining xavfsiz markup, ixcham sanalari va ma'lumot ierarxiyasi.
import { esc } from '../core/dom.js';
import { dateTime } from '../core/format.js';
import { empty } from '../components/empty-state.js';
import { action } from '../components/page-heading.js';
import { data } from './data.js';
import { codeCard, codeMenuActions } from './test-codes.js';
import { cardIcon } from './test-card-icons.js';
const LABELS = { active: 'Faol', paused: "To'xtatilgan", scheduled: 'Jadvalda', ended: 'Yakunlangan' };
const MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentabr',
  'oktabr',
  'noyabr',
  'dekabr',
];
function shortDate(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return '—';
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tashkent',
    day: 'numeric',
    month: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(value));
  const get = (type) => parts.find((part) => part.type === type).value;
  return `${Number(get('day'))}-${MONTHS[Number(get('month')) - 1]}, ${get('hour')}:${get('minute')}`;
}
function timeMarkup(value) {
  if (!value || !Number.isFinite(Date.parse(value))) return '—';
  return `<time datetime="${esc(value)}" title="${esc(dateTime(value))}">${esc(shortDate(value))}</time>`;
}
function menu(test) {
  const codeActions = codeMenuActions(test);
  const count = test.testCode ? (test.testCode.state === 'inactive' ? 6 : 5) : 4;
  return `<div class="test-card-top" data-menu-size="${count}">
    <span class="test-card-status ${esc(test.status)}">${LABELS[test.status] || esc(test.status)}</span>
    <details class="test-card-menu"><summary class="btn secondary test-card-more" aria-label="Boshqa amallar" title="Boshqa amallar">${cardIcon('more')}</summary>
      <div class="test-card-menu-items" aria-label="Boshqa amallar">
        ${action('edit-test', 'Tahrirlash', test.id, 'secondary')}
        ${action('duplicate-test', 'Nusxa olish', test.id, 'secondary')}
        ${action('export-test', 'Eksport', test.id, 'secondary')}
        ${codeActions}
        ${action('delete-test', "O'chirish", test.id, 'danger')}
      </div>
    </details></div>`;
}
function meta(test) {
  const rows = [
    ['clock', test.settings.timeLimitMin ? test.settings.timeLimitMin + ' daqiqa' : 'Vaqt cheklanmagan'],
    ['question', test.count + ' savol'],
    ['repeat', test.settings.maxAttempts + ' urinish'],
    ...(test.settings.shuffleQuestions ? [['shuffle', 'Aralashtiriladi']] : []),
  ];
  return `<div class="test-card-meta">${rows.map(([icon, text]) => `<span>${cardIcon(icon)}${esc(text)}</span>`).join('')}</div>`;
}
export function testCards(list) {
  if (!list.length) return empty('Test topilmadi', "Yangi test yuklang yoki qidiruvni o'zgartiring.");
  return `<div class="cards-grid">${list
    .map(
      (test) => `<article class="card test-card" data-test-id="${esc(test.id)}">
    ${menu(test)}
    <h2 class="test-card-title">${esc(test.title)}</h2>
    <div class="test-card-chips">
      <span class="test-card-chip">Fan: ${esc(test.subject || 'Belgilanmagan')}</span>
      <span class="test-card-chip grade">Sinf: ${test.classIds.map((id) => esc(data.classes.find((row) => row.id === id)?.name || 'Eski sinf')).join(', ') || '—'}</span>
    </div>
    ${meta(test)}
    <dl class="test-card-schedule"><div><dt>Boshlanish:</dt><dd>${timeMarkup(test.schedule.start)}</dd></div><div><dt>Tugash:</dt><dd>${timeMarkup(test.schedule.end)}</dd></div></dl>
    ${codeCard(test)}
    <footer class="test-card-footer">
      <p class="test-card-created">${test.createdAt ? "Qo'shilgan vaqt: " + timeMarkup(test.createdAt) : "Qo'shilgan vaqt noma'lum"}</p>
      <div class="test-card-actions">${action('edit-test', 'Tahrirlash', test.id, 'primary')}${action('toggle-test', test.active ? "To'xtatish" : 'Faollashtirish', test.id, 'secondary test-card-toggle')}</div>
    </footer>
  </article>`
    )
    .join('')}</div>`;
}
