// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ChevronLeft, ChevronRight } from '../../components/icons.js';
export function view6(scope) {
  const numbers = [...new Set([1, scope.page - 1, scope.page, scope.page + 1, scope.pages])]
    .filter((page) => page > 0 && page <= scope.pages)
    .sort((a, b) => a - b);
  return el(
    'div',
    { className: 'flex flex-wrap items-center gap-1.5', 'aria-label': 'Natijalar sahifalari' },
    el(
      'button',
      {
        type: 'button',
        disabled: scope.loading || scope.page <= 1,
        onClick: () => scope.setPage((p) => Math.max(1, p - 1)),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800',
      },
      el(ChevronLeft, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Oldingi')
    ),
    ...numbers.map((page) =>
      el(
        'button',
        {
          key: page,
          type: 'button',
          className: 'results-page-number',
          disabled: scope.loading,
          'aria-current': page === scope.page ? 'page' : undefined,
          'aria-label': `${page}-sahifa`,
          onClick: () => scope.setPage(page),
        },
        page
      )
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: scope.loading || scope.page >= scope.pages,
        onClick: () => scope.setPage((p) => Math.min(scope.pages, p + 1)),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 font-medium hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:hover:bg-slate-800',
      },
      el('span', null, 'Keyingi'),
      el(ChevronRight, { className: 'h-3.5 w-3.5' })
    )
  );
}
