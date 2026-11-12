// Eng so'nggi topshirilgan test/guruhlar xulosasini bir daqiqada yangilaydi.
import { call } from './teacher-api.js';
import { esc } from '../core/dom.js';
import { dateTime } from '../core/format.js';
import { action } from '../components/page-heading.js';
const RECENT_INTERVAL_MS = 60000;
let rows = [],
  timer,
  stopped = false,
  running = false;
let status = 'Yuklanmoqda...';
export function recentResultsView() {
  return `<section class="card"><h2>Eng so'nggi ishlangan testlar</h2>
    <p class="help">Ro'yxat har 60 soniyada yangilanadi. Natijalarni ochish uchun testni tanlang.</p>
    <div id="recent-results" aria-live="polite">${recentList()}</div></section>`;
}
function recentList() {
  return rows.length
    ? rows
        .map(
          (row, index) => `<div class="row between spacing-1">
    <span>${esc(row.testTitle)} · ${esc(row.grade || 'Guruhsiz')} · ${esc(row.count)} natija · ${esc(dateTime(row.time))}</span>
    ${action('recent-results', "Natijalarni ko'rish", String(index), 'secondary small')}</div>`
        )
        .join('') + `<p class="help">${esc(status)}</p>`
    : `<p class="help">${esc(status)}</p>`;
}
export const recentSelection = (index) => rows[Number(index)];
export async function refreshRecent() {
  if (stopped || running || document.hidden || document.querySelector('dialog[open]')) return;
  running = true;
  try {
    rows = await call('results/recent');
    status = rows.length ? 'Yangilandi: ' + dateTime(new Date().toISOString()) : "Hozircha natija yo'q.";
  } catch {
    status = "Oxirgi ro'yxatni yangilab bo'lmadi. Keyingi urinish 60 soniyadan so'ng.";
  } finally {
    running = false;
    const target = document.getElementById('recent-results');
    if (target && !stopped) target.innerHTML = recentList();
  }
}
export function startRecent() {
  async function tick() {
    await refreshRecent();
    if (!stopped) timer = setTimeout(tick, RECENT_INTERVAL_MS);
  }
  tick();
  window.addEventListener(
    'pagehide',
    () => {
      stopped = true;
      clearTimeout(timer);
    },
    { once: true }
  );
}
