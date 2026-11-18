// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ChevronLeft, ChevronRight } from '../../components/icons.js';
export function view6(scope) {
  return el(
    'div',
    { className: 'flex items-center gap-1.5' },
    el(
      'button',
      {
        type: 'button',
        disabled: scope.page <= 1,
        onClick: () => scope.setPage((p) => Math.max(1, p - 1)),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800',
      },
      el(ChevronLeft, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Oldingi')
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: scope.page >= scope.pages,
        onClick: () => scope.setPage((p) => Math.min(scope.pages, p + 1)),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800',
      },
      el('span', null, 'Keyingi'),
      el(ChevronRight, { className: 'h-3.5 w-3.5' })
    )
  );
}
