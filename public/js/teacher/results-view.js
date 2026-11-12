// Natijalar sahifasining kartalari, server filtrlari va sahifalash ko'rinishi.
import { data } from './data.js';
import { filters, resultRequest, overview } from './results-request.js';
import { recentResultsView } from './recent-results.js';
import { rowsTable } from '../components/table.js';
import { heading, action } from '../components/page-heading.js';
import { esc } from '../core/dom.js';
const number = (value) => (value == null ? '—' : value.toLocaleString('uz-UZ').replace(/[,\u00a0]/g, ' '));
export function resultsView() {
  const counts = overview.counts;
  const stats = [
    ['Testlar', counts?.tests, '▤'],
    ['Topshirishlar', counts?.submissions, '✓'],
    ['Sinflar va guruhlar', counts?.classes, '♧'],
  ];
  return (
    heading(
      'Natijalar',
      "O'quvchilar natijalarini kuzating va tahlil qiling.",
      action('refresh', '↻ Yangilash', '', 'secondary')
    ) +
    `<div class="results-stats">${stats.map(([label, value, icon]) => `<article class="card result-stat"><span class="stat-icon" aria-hidden="true">${icon}</span><div><p>${label}</p><strong>${number(value)}</strong></div></article>`).join('')}</div>
    <div class="results-columns"><section class="card results-table-card">
    <div class="card-head"><div><h2>Topshirishlar</h2><p class="help">Barcha natijalar bir joyda</p></div>
    <details class="results-export no-print"><summary class="btn secondary small">Eksport ↓</summary><div class="export-options">
      ${action('csv', 'CSV', '', 'ghost')}${action('excel', 'Excel (.xlsx)', '', 'ghost')}${action('print', 'Chop etish', '', 'ghost')}</div></details></div>
    ${resultFilters()}<div id="result-list" aria-live="polite">${resultList()}</div></section>${recentResultsView()}</div>`
  );
}
function resultFilters() {
  const tests = new Map([
    ...data.tests.map((t) => [t.id, t.title]),
    ...overview.catalogue.map((t) => [t.testId, t.testTitle]),
  ]);
  return `<div class="results-filters no-print">
    <label class="results-search"><span class="sr-only">O'quvchi qidirish</span><input id="result-search" type="search" placeholder="O'quvchini qidirish..." value="${esc(filters.search)}"></label>
    <label><span class="sr-only">Test filtri</span><select id="result-test"><option value="">Barcha testlar</option>${[...tests].map(([id, title]) => `<option value="${esc(id)}" ${filters.testId === id ? 'selected' : ''}>${esc(title)}</option>`).join('')}</select></label>
    <label><span class="sr-only">Sinf yoki guruh filtri</span><select id="result-class"><option value="">Sinf yoki guruh</option>${data.classes.map((c) => `<option value="${esc(c.id)}" ${filters.classId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
    <label><span class="sr-only">Saralash</span><select id="result-sort">${[
      ['time', 'Eng yangi'],
      ['score', 'Yuqori foiz'],
      ['name', "Familiya bo'yicha"],
    ]
      .map(
        ([id, title]) => `<option value="${id}" ${filters.sort === id ? 'selected' : ''}>${title}</option>`
      )
      .join('')}</select></label></div>`;
}
export function resultList() {
  if (resultRequest.loading)
    return '<div class="results-state" role="status"><div class="skeleton"></div><p>Natijalar yuklanmoqda...</p></div>';
  if (!resultRequest.ready)
    return `<div class="results-state" role="alert"><p class="error">${esc(resultRequest.message)}</p>${action('reload-results', 'Qayta urinish', '', 'secondary')}</div>`;
  if (!data.results.length)
    return '<div class="results-state"><h3>Natija topilmadi</h3><p class="help">Qidiruv yoki filtrlarni o\'zgartiring. Topshirishlar shu yerda ko\'rinadi.</p></div>';
  return rowsTable(data.results) + pagination();
}
function pagination() {
  const { page, pages, total } = resultRequest;
  const items = new Set([1, pages, page - 1, page, page + 1].filter((n) => n > 0 && n <= pages));
  let previous = 0;
  const buttons = [...items]
    .sort((a, b) => a - b)
    .map((n) => {
      const gap = n - previous > 1 ? '<span class="page-gap">…</span>' : '';
      previous = n;
      return (
        gap +
        `<button class="btn small ${n === page ? 'current' : 'ghost'}" data-action="result-page" data-id="${n}" ${n === page ? 'aria-current="page"' : ''}>${n}</button>`
      );
    })
    .join('');
  return `<nav class="results-pagination no-print" aria-label="Natijalar sahifalari"><p>${number((page - 1) * 20 + 1)}–${number(Math.min(page * 20, total))} / ${number(total)}</p><div class="page-buttons">
    <button class="btn ghost small" data-action="result-page" data-id="${page - 1}" ${page === 1 ? 'disabled' : ''}>Oldingi</button>${buttons}<button class="btn ghost small" data-action="result-page" data-id="${page + 1}" ${page === pages ? 'disabled' : ''}>Keyingi</button></div></nav>`;
}
