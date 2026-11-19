// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view0(scope) {
  return el(
    'div',
    { className: 'space-y-2 sm:col-span-2' },
    el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Auditoriya turi'),
    el(
      'div',
      { className: 'flex flex-wrap gap-4' },
      el(
        'label',
        {
          className:
            'inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200',
        },
        el('input', {
          type: 'checkbox',
          checked: scope.forClass,
          onChange: (e) => scope.setForClass(e.target.checked),
          className: 'h-4 w-4 rounded border-slate-300 text-blue-600',
        }),
        el('span', null, 'Sinflar')
      ),
      el(
        'label',
        {
          className:
            'inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200',
        },
        el('input', {
          type: 'checkbox',
          checked: scope.forGroup,
          onChange: (e) => scope.setForGroup(e.target.checked),
          className: 'h-4 w-4 rounded border-slate-300 text-blue-600',
        }),
        el('span', null, 'Guruhlar')
      )
    )
  );
}
