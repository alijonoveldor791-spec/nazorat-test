// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ChevronLeft, ChevronRight } from '../../components/icons.js';
export function view11(scope) {
  return el(
    'div',
    { className: 'flex items-center gap-2' },
    el(
      'select',
      {
        value: scope.testPageSize,
        onChange: (e) => {
          scope.setTestPageSize(Number(e.target.value));
          scope.setTestPage(1);
        },
        'aria-label': 'Sahifa hajmi',
        className:
          'rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950',
      },
      el('option', { value: 4 }, '4 ta'),
      el('option', { value: 8 }, '8 ta'),
      el('option', { value: 20 }, '20 ta')
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: scope.currentSavedPage <= 1,
        onClick: () => scope.setTestPage((p) => Math.max(1, p - 1)),
        className: 'rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 dark:border-slate-700',
      },
      el(ChevronLeft, { className: 'h-3.5 w-3.5' })
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: scope.currentSavedPage >= scope.savedPages,
        onClick: () => scope.setTestPage((p) => Math.min(scope.savedPages, p + 1)),
        className: 'rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 dark:border-slate-700',
      },
      el(ChevronRight, { className: 'h-3.5 w-3.5' })
    )
  );
}
