// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { formatDateTime } from '../../core/format.js';
export function view4(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-6 space-y-3 dark:border-slate-800 dark:bg-slate-900',
    },
    el('h2', { className: 'font-display text-lg font-bold text-slate-900 dark:text-white' }, 'Obunalar'),
    scope.schools.length === 0
      ? el('p', { className: 'text-sm text-slate-500' }, "Obunalar hali yo'q.")
      : el(
          'div',
          { className: 'divide-y divide-slate-100 dark:divide-slate-800' },
          scope.schools.map((row) =>
            el(
              'div',
              { key: row.id, className: 'flex flex-wrap items-center justify-between gap-2 py-3 text-sm' },
              el('span', { className: 'font-semibold text-slate-900 dark:text-white' }, row.name),
              el(
                'span',
                { className: 'text-slate-600 dark:text-slate-300' },
                row.subscription ? (row.subscriptionActive ? 'Faol' : 'Tugagan') : 'Belgilanmagan',
                ' ',
                '\u00B7 ',
                formatDateTime(row.subscription?.endsAt)
              )
            )
          )
        )
  );
}
