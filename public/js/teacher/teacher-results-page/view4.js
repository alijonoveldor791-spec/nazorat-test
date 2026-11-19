// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { formatDateTime, percent, resultScore } from '../../core/format.js';
import { view3 } from './view3.js';
import { statusLabel } from './result-status.js';
export function view4(scope, r, index) {
  return el(
    'tr',
    { key: r.id, className: 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40' },
    el('td', { className: 'px-4 py-3' }, (scope.page - 1) * 20 + index + 1),
    el('td', { className: 'px-4 py-3 font-medium text-slate-900 dark:text-white' }, r.surname, ' ', r.name),
    el('td', { className: 'px-4 py-3 text-slate-600 dark:text-slate-300' }, r.grade),
    el(
      'td',
      { className: 'px-4 py-3 max-w-[220px] truncate text-slate-700 dark:text-slate-200' },
      r.testTitle
    ),
    el(
      'td',
      { className: 'px-4 py-3 text-right tabular-nums text-slate-800 dark:text-slate-200' },
      r.hasResult === false ? '—' : resultScore(r)
    ),
    el(
      'td',
      { className: 'px-4 py-3 text-right tabular-nums font-semibold text-slate-900 dark:text-white' },
      r.hasResult === false ? '—' : `${percent(r)}%`
    ),
    el(
      'td',
      { className: 'px-4 py-3 text-xs text-slate-500 whitespace-nowrap dark:text-slate-400' },
      r.time ? formatDateTime(r.time) : '—'
    ),
    el('td', { className: 'px-4 py-3' }, el('span', { className: 'results-status' }, statusLabel(r))),
    r.hasResult === false ? el('td', { className: 'px-4 py-3 no-print' }, '—') : view3(scope, r)
  );
}
