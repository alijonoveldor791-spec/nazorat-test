// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { EmptyState } from '../../components/ui/empty-state.js';
import { view5 } from './view5.js';
import { view6 } from './view6.js';
export function view7(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900',
    },
    scope.loading
      ? el(
          'div',
          { className: 'p-6 space-y-3' },
          [0, 1, 2, 3].map((i) =>
            el('div', { key: i, className: 'h-12 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800' })
          )
        )
      : scope.rows.length === 0
        ? el(
            'div',
            { className: 'p-8' },
            el(EmptyState, {
              title: 'Natijalar topilmadi',
              description: "Filtrni o'zgartiring yoki o'quvchilar test topshirishini kuting.",
            })
          )
        : el('div', { className: 'overflow-x-auto' }, view5(scope)),
    scope.total > 0 &&
      el(
        'div',
        {
          className:
            'flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400 no-print',
        },
        el(
          'span',
          { className: 'tabular-nums' },
          'Jami ',
          scope.total,
          ' ta natija \u00B7 ',
          scope.page,
          ' / ',
          scope.pages,
          ' sahifa'
        ),
        view6(scope)
      )
  );
}
