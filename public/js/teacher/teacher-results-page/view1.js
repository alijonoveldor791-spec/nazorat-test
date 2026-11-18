// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view1(scope) {
  return el(
    'div',
    { className: 'flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 no-print' },
    el('span', { className: 'font-medium' }, "So'nggi testlar:"),
    scope.overview.recent.slice(0, 5).map((item) =>
      el(
        'button',
        {
          key: item.id,
          type: 'button',
          onClick: () => {
            scope.setTestId((prev) => (prev === item.id ? '' : item.id));
            scope.setPage(1);
          },
          className: `rounded-lg border px-2.5 py-1 transition-colors ${
            scope.testId === item.id
              ? 'border-blue-600 bg-blue-50 font-semibold text-blue-700 dark:border-blue-500 dark:bg-blue-950/60 dark:text-blue-300'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
          }`,
        },
        item.title
      )
    )
  );
}
