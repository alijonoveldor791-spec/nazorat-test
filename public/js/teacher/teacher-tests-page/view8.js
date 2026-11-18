// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { Copy, Download, Edit3, PauseCircle, PlayCircle, Trash2, UserPlus } from '../../components/icons.js';
export function view8(scope, test) {
  return el(
    'footer',
    {
      className:
        'mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800',
    },
    el(
      Link,
      {
        to: `/oqituvchi/test-tahrir?id=${encodeURIComponent(test.id)}`,
        className:
          'inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap',
      },
      el(Edit3, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Tahrirlash')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.handleToggle(test.id),
        className:
          'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      test.active
        ? el(fragment, null, el(PauseCircle, { className: 'h-3.5 w-3.5' }), el('span', null, "To'xtatish"))
        : el(fragment, null, el(PlayCircle, { className: 'h-3.5 w-3.5' }), el('span', null, 'Faollashtirish'))
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.openAssignModal(test),
        title: 'Sinf yoki guruh biriktirish',
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(UserPlus, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Biriktirish')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.handleDuplicate(test.id),
        title: 'Nusxa olish',
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(Copy, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Nusxa')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.handleExportAiken(test.id),
        title: 'Aiken .txt eksport',
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(Download, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Aiken')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.setDeleteTarget(test),
        'aria-label': `${test.title} o'chirish`,
        className:
          'ml-auto inline-flex items-center rounded-lg border border-transparent p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400',
      },
      el(Trash2, { className: 'h-4 w-4' })
    )
  );
}
