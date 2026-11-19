// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Trash2 } from '../../components/icons.js';
export function view1(scope) {
  return el(
    'div',
    { className: 'flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400' },
    el(
      'label',
      {
        className:
          'inline-flex cursor-pointer items-center gap-2 font-medium text-slate-700 dark:text-slate-200',
      },
      el('input', {
        type: 'checkbox',
        checked: scope.allVisibleSelected,
        disabled: scope.visibleTests.length === 0,
        onChange: () => {
          if (scope.allVisibleSelected) scope.setSelectedIds(new Set());
          else scope.setSelectedIds(new Set(scope.visibleTests.map((t) => t.id)));
        },
        className: 'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500',
      }),
      el('span', null, 'Hammasini tanlash')
    ),
    el('span', { className: 'tabular-nums text-xs' }, scope.visibleTests.length, ' ta test'),
    scope.selectedIds.size > 0 &&
      el(
        'button',
        {
          type: 'button',
          onClick: () => scope.setBulkDeleteOpen(true),
          className:
            'inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 whitespace-nowrap',
        },
        el(Trash2, { className: 'h-3.5 w-3.5' }),
        el('span', null, "Tanlanganlarni o'chirish (", scope.selectedIds.size, ')')
      )
  );
}
