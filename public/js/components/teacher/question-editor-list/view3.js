// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { Trash2 } from '../../icons.js';
export function view3(scope, i, q) {
  return el(
    'div',
    {
      className:
        'flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800',
    },
    el(
      'div',
      { className: 'flex items-center gap-3' },
      scope.selectionSet &&
        scope.onToggleSelect &&
        el(
          'label',
          {
            className:
              'inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300',
          },
          el('input', {
            type: 'checkbox',
            checked: scope.selectionSet.has(i),
            onChange: () => scope.onToggleSelect(i),
            className: 'h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500',
          }),
          el('span', null, 'Olish')
        ),
      el(
        'h3',
        { className: 'font-display text-sm font-bold text-slate-900 dark:text-white' },
        i + 1,
        '-savol',
        q.section ? ` · ${q.section.type} / ${q.section.subject}` : ''
      )
    ),
    scope.questions.length > 1 || scope.allowAdd
      ? el(
          'button',
          {
            type: 'button',
            onClick: () => scope.handleRemoveQuestion(i),
            className:
              'inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40',
          },
          el(Trash2, { className: 'h-3.5 w-3.5' }),
          el('span', null, "O'chirish")
        )
      : null
  );
}
