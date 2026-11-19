// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { LoadingState } from '../../components/ui/loading-state.js';
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
      ? el(LoadingState, { label: "Ma'lumotlar yuklanmoqda..." })
      : scope.error
        ? el(
            'div',
            { className: 'p-8', role: 'alert' },
            el('p', null, scope.error),
            el(
              'button',
              { type: 'button', className: 'results-secondary', onClick: () => scope.loadResults() },
              'Qayta urinish'
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
            'results-pagination flex items-center justify-between border-t border-slate-200 px-4 py-3 text-xs text-slate-600 dark:border-slate-800 dark:text-slate-400 no-print',
        },
        el(
          'span',
          { className: 'tabular-nums' },
          `${(scope.page - 1) * 20 + 1}–${Math.min(scope.page * 20, scope.total)} / ${scope.total} ta yozuv · `,
          scope.page,
          ' / ',
          scope.pages,
          ' sahifa'
        ),
        view6(scope)
      )
  );
}
