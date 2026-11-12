// Eng so'nggi topshirilgan test/guruhlar xulosasini foydalanuvchi so'rovi bilan oladi.
import { call } from './teacher-api.js';
import { esc } from '../core/dom.js';
import { dateTime } from '../core/format.js';
import { action } from '../components/page-heading.js';
let rows = [],
  running = false;
let status = "Ro'yxatni olish uchun Yangilash tugmasini bosing.";
export function recentResultsView() {
  return `<section class="card"><div class="card-head"><h2>Eng so'nggi ishlangan testlar</h2>
    ${action('refresh-recent', 'Yangilash', '', 'secondary small')}</div>
    <p class="help">Ro'yxat Yangilash tugmasi orqali olinadi. Natijalarni ochish uchun testni tanlang.</p>
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
  if (running) return;
  running = true;
  status = 'Yuklanmoqda...';
  renderRecent();
  try {
    rows = await call('results/recent');
    status = rows.length ? 'Yangilandi: ' + dateTime(new Date().toISOString()) : "Hozircha natija yo'q.";
  } catch {
    status = "Ro'yxatni yangilab bo'lmadi. Yangilash tugmasi orqali qayta urining.";
  } finally {
    running = false;
    renderRecent();
  }
}
function renderRecent() {
  const target = document.getElementById('recent-results');
  if (target) target.innerHTML = recentList();
}
