// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Eye } from '../../components/icons.js';
import { formatDateTime, percent } from '../../core/format.js';
export function view1(scope, row) {
  return el(
    'tr',
    { key: row.id, className: 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40' },
    el(
      'td',
      { className: 'py-3 pr-3' },
      el('div', { className: 'font-medium text-slate-900 dark:text-white' }, row.surname, ' ', row.name),
      el('div', { className: 'text-xs text-slate-500 dark:text-slate-400' }, row.grade)
    ),
    el(
      'td',
      { className: 'py-3 pr-3' },
      el('div', { className: 'max-w-[180px] truncate text-slate-700 dark:text-slate-200' }, row.testTitle),
      el('div', { className: 'text-xs text-slate-500 dark:text-slate-400' }, formatDateTime(row.time))
    ),
    el(
      'td',
      { className: 'py-3 pr-3 text-right tabular-nums' },
      el('span', { className: 'font-semibold text-slate-900 dark:text-white' }, percent(row), '%'),
      el('div', { className: 'text-xs text-slate-500 dark:text-slate-400' }, row.score, '/', row.total)
    ),
    el(
      'td',
      { className: 'py-3 text-right' },
      el(
        'button',
        {
          type: 'button',
          onClick: () => scope.openDetail(row.id),
          disabled: scope.detailLoading,
          className:
            'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
        },
        el(Eye, { className: 'h-3.5 w-3.5' }),
        el('span', null, "Ko'rish")
      )
    )
  );
}
