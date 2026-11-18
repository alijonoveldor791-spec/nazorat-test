// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view8(scope, row) {
  return el(
    'div',
    { key: row.test.id, className: 'rounded-xl border border-slate-200 p-4 dark:border-slate-800' },
    el(
      'div',
      { className: 'flex items-center justify-between gap-2' },
      el('h3', { className: 'font-semibold text-slate-900 dark:text-white' }, row.test.title),
      el(
        'span',
        { className: 'text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400' },
        row.submitted,
        ' / ',
        row.total,
        ' topshirdi'
      )
    ),
    row.missing.length > 0
      ? el(
          'p',
          { className: 'mt-2 text-xs text-slate-500 dark:text-slate-400' },
          'Topshirmaganlar:',
          ' ',
          el(
            'span',
            { className: 'text-slate-700 dark:text-slate-200' },
            row.missing.map((m) => `${m.surname} ${m.name}`).join(', ')
          )
        )
      : el(
          'p',
          { className: 'mt-2 text-xs text-emerald-600 dark:text-emerald-400' },
          "Barcha o'quvchilar topshirgan."
        )
  );
}
