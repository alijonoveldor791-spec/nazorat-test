// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { LayoutGrid, List } from '../../components/icons.js';
export function view2(scope) {
  return el(
    'div',
    {
      className:
        'inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.setViewMode('cards'),
        className: `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          scope.viewMode === 'cards'
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`,
      },
      el(LayoutGrid, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Kartalar')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.setViewMode('list'),
        className: `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
          scope.viewMode === 'list'
            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
            : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
        }`,
      },
      el(List, { className: 'h-3.5 w-3.5' }),
      el('span', null, "Ro'yxat")
    )
  );
}
