// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Users } from '../../components/icons.js';
export function view3(scope, cls, isGroup, studentCount) {
  return el(
    'div',
    { className: 'flex items-start justify-between gap-3' },
    el(
      'label',
      { className: 'flex items-start gap-2.5 cursor-pointer min-w-0' },
      el('input', {
        type: 'checkbox',
        checked: scope.selectedIds.has(cls.id),
        onChange: () => scope.toggleSelectOne(cls.id),
        className: 'mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500',
      }),
      el(
        'div',
        { className: 'min-w-0' },
        el(
          'p',
          { className: 'text-xs font-medium text-slate-500 dark:text-slate-400' },
          isGroup ? `Guruh · ${cls.direction || "Yo'nalishsiz"}` : 'Sinf'
        ),
        el(
          'h2',
          { className: 'mt-0.5 font-display text-lg font-bold text-slate-900 truncate dark:text-white' },
          cls.name
        )
      )
    ),
    el(
      'span',
      {
        className:
          'inline-flex items-center gap-1 text-xs font-medium text-slate-500 tabular-nums shrink-0 dark:text-slate-400',
      },
      el(Users, { className: 'h-3.5 w-3.5' }),
      studentCount,
      " o'quvchi"
    )
  );
}
