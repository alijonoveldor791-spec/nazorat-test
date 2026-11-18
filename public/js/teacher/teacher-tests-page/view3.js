// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { STATUS_LABELS } from './shared.js';
export function view3(scope, test, statusColor) {
  return el(
    'label',
    { className: 'flex items-start gap-2.5 cursor-pointer min-w-0' },
    el('input', {
      type: 'checkbox',
      checked: scope.selectedIds.has(test.id),
      onChange: () =>
        scope.setSelectedIds((prev) => {
          const next = new Set(prev);
          if (next.has(test.id)) next.delete(test.id);
          else next.add(test.id);
          return next;
        }),
      className: 'mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500',
    }),
    el(
      'div',
      { className: 'min-w-0' },
      el(
        'div',
        { className: 'flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-medium' },
        el('span', { className: statusColor }, STATUS_LABELS[test.status] || test.status),
        el('span', { className: 'text-slate-300 dark:text-slate-700' }, '\u00B7'),
        el(
          'span',
          { className: 'text-slate-500 dark:text-slate-400' },
          test.testType === 'block'
            ? `Blok test${test.settings.scoringMode === 'dtm' ? ' (DTM 189 ball)' : ''}`
            : 'Oddiy test'
        )
      ),
      el(
        'h2',
        { className: 'mt-1 font-display text-lg font-bold text-slate-900 dark:text-white' },
        test.title
      )
    )
  );
}
