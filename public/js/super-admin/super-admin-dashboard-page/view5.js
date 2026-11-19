// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view5(scope) {
  return el(
    'table',
    { className: 'w-full text-left text-sm' },
    el(
      'thead',
      {
        className:
          'border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-950',
      },
      el(
        'tr',
        null,
        el('th', { className: 'px-4 py-3' }, 'Maktab'),
        el('th', { className: 'px-4 py-3 text-right' }, 'Sinflar'),
        el('th', { className: 'px-4 py-3 text-right' }, 'Testlar'),
        el('th', { className: 'px-4 py-3 text-right' }, 'Urinishlar'),
        el('th', { className: 'px-4 py-3 text-right' }, 'Natijalar')
      )
    ),
    el(
      'tbody',
      { className: 'divide-y divide-slate-100 dark:divide-slate-800' },
      scope.stats.bySchool.map((row) => {
        const sch = scope.schools.find((s) => s.id === row.schoolId);
        return el(
          'tr',
          { key: row.schoolId },
          el(
            'td',
            { className: 'px-4 py-3 font-medium text-slate-900 dark:text-white' },
            sch?.name || row.schoolId
          ),
          el('td', { className: 'px-4 py-3 text-right tabular-nums' }, row.classes),
          el('td', { className: 'px-4 py-3 text-right tabular-nums' }, row.tests),
          el('td', { className: 'px-4 py-3 text-right tabular-nums' }, row.attempts),
          el('td', { className: 'px-4 py-3 text-right tabular-nums' }, row.results)
        );
      })
    )
  );
}
