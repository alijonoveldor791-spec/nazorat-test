// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view3(scope) {
  return el(
    'div',
    { className: 'grid gap-4 sm:grid-cols-2' },
    el(
      'div',
      null,
      el(
        'label',
        {
          htmlFor: 'student-surname',
          className: 'block text-sm font-medium text-slate-700 dark:text-slate-200',
        },
        'Familiya'
      ),
      el('input', {
        id: 'student-surname',
        value: scope.surname,
        onChange: (e) => {
          scope.setSurname(e.target.value);
          scope.setError('');
        },
        maxLength: 60,
        placeholder: 'Masalan: Aliyev',
        className:
          'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    el(
      'div',
      null,
      el(
        'label',
        {
          htmlFor: 'student-name',
          className: 'block text-sm font-medium text-slate-700 dark:text-slate-200',
        },
        'Ism'
      ),
      el('input', {
        id: 'student-name',
        value: scope.name,
        onChange: (e) => {
          scope.setName(e.target.value);
          scope.setError('');
        },
        maxLength: 60,
        placeholder: 'Masalan: Sardor',
        className:
          'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    )
  );
}
