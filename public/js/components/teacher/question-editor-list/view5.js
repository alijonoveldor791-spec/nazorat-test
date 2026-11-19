// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { Plus, RotateCcw } from '../../icons.js';
export function view5(scope, q, i, history) {
  return el(
    'div',
    { className: 'flex flex-wrap items-center gap-2 pt-1' },
    el(
      'button',
      {
        type: 'button',
        disabled: q.options.length >= 6,
        onClick: () => scope.handleAddOption(i),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(Plus, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Variant')
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: q.options.length <= 2,
        onClick: () => scope.handleRemoveOption(i),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el('span', null, 'Oxirgi variantni olish')
    ),
    history.length > 0 &&
      q.options.length < 6 &&
      el(
        'button',
        {
          type: 'button',
          onClick: () => scope.handleRestoreOption(i),
          className:
            'inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300',
        },
        el(RotateCcw, { className: 'h-3.5 w-3.5' }),
        el('span', null, 'Variantni qaytarish')
      )
  );
}
