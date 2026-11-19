// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { CheckSquare, Edit3, KeyRound, Trash2 } from '../../components/icons.js';
export function view4(scope, cls) {
  return el(
    'div',
    {
      className:
        'mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800',
    },
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.openEditor(cls),
        className:
          'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(Edit3, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Tahrirlash')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.setCodesModalClass(cls),
        className:
          'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(KeyRound, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Kodlar')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.setProgressModalClass(cls),
        className:
          'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(CheckSquare, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Holat')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.setDeleteTarget(cls),
        'aria-label': `${cls.name} o'chirish`,
        className:
          'ml-auto inline-flex items-center rounded-lg border border-transparent p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400',
      },
      el(Trash2, { className: 'h-4 w-4' })
    )
  );
}
