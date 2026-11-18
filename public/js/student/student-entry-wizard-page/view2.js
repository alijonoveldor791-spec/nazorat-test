// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view2(scope) {
  return el(
    'div',
    { className: 'space-y-3' },
    el(
      'label',
      { htmlFor: 'grade-select', className: 'block text-sm font-medium text-slate-700 dark:text-slate-200' },
      'Sinf yoki guruhingizni tanlang'
    ),
    el(
      'select',
      {
        id: 'grade-select',
        value: scope.classId,
        onChange: (e) => {
          scope.setClassId(e.target.value);
          scope.setError('');
        },
        className:
          'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      },
      el('option', { value: '' }, 'Sinf yoki guruhni tanlang'),
      scope.resolved.classes.map((c) =>
        el('option', { key: c.id, value: c.id }, c.name, c.direction ? ` (${c.direction})` : '')
      )
    )
  );
}
