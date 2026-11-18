// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view10 } from './view10.js';
export function view11(scope) {
  return el(
    'form',
    { id: 'assign-test-form', onSubmit: scope.handleAssignSubmit, className: 'space-y-4' },
    el(
      'p',
      { className: 'text-xs text-slate-500 dark:text-slate-400' },
      "Oldingi biriktirishlar saqlanadi. Qo'shimcha sinf yoki guruhlarni belgilang."
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, "Yo'nalish"),
      el(
        'select',
        {
          value: scope.assignDirection,
          onChange: (e) => {
            scope.setAssignDirection(e.target.value);
            scope.setAssignClassIds(new Set());
          },
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        },
        el('option', { value: '' }, 'Faqat sinflar'),
        scope.assignDirections.map((d) => el('option', { key: d, value: d }, d))
      )
    ),
    view10(scope)
  );
}
