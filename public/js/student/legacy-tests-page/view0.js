// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view0(scope) {
  return el(
    'div',
    { className: 'grid gap-4 sm:grid-cols-2' },
    el(
      'div',
      null,
      el('label', { className: 'block text-sm font-medium text-slate-700 dark:text-slate-200' }, 'Familiya'),
      el('input', {
        value: scope.surname,
        onChange: (e) => scope.setSurname(e.target.value),
        required: true,
        maxLength: 60,
        className:
          'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'div',
      null,
      el('label', { className: 'block text-sm font-medium text-slate-700 dark:text-slate-200' }, 'Ism'),
      el('input', {
        value: scope.name,
        onChange: (e) => scope.setName(e.target.value),
        required: true,
        maxLength: 60,
        className:
          'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    )
  );
}
