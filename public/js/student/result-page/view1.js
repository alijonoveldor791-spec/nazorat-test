// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { RefreshCw, Trash2 } from '../../components/icons.js';
import { clearStoredResult } from '../../core/attempt-storage.js';
export function view1(scope) {
  return el(
    'div',
    { className: 'flex items-center gap-2' },
    el(
      'button',
      {
        type: 'button',
        disabled: scope.refreshing,
        onClick: () => scope.refresh(scope.saved),
        className:
          'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(RefreshCw, { className: `h-3.5 w-3.5 ${scope.refreshing ? 'animate-spin' : ''}` }),
      el('span', null, 'Yangilash')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => {
          clearStoredResult();
          scope.navigate('/', { replace: true });
        },
        className:
          'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(Trash2, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Tozalash')
    )
  );
}
