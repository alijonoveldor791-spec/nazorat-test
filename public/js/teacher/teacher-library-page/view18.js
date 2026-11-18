// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Archive, Edit3 } from '../../components/icons.js';
export function view18(scope, q) {
  return el(
    'div',
    { className: 'flex items-center gap-2' },
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.setEditingQuestion(structuredClone(q)),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200',
      },
      el(Edit3, { className: 'h-3 w-3' }),
      el('span', null, 'Tahrirlash')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.handleToggleArchiveQuestion(q),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200',
      },
      el(Archive, { className: 'h-3 w-3' }),
      el('span', null, q.archived ? 'Tiklash' : 'Arxivlash')
    )
  );
}
