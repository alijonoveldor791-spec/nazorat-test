// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view3 } from './view3.js';
import { view4 } from './view4.js';
export function view5(scope) {
  return el(
    'div',
    { className: scope.viewMode === 'cards' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3' },
    scope.visibleClasses.map((cls) => {
      const studentCount = cls.students?.length ?? cls.studentCount ?? 0;
      const assignedTests = scope.tests.filter((t) => t.classIds.includes(cls.id)).length;
      const isGroup = cls.kind === 'group';
      return el(
        'article',
        {
          key: cls.id,
          className:
            'rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
        },
        view3(scope, cls, isGroup, studentCount),
        el(
          'p',
          { className: 'mt-3 text-xs text-slate-500 dark:text-slate-400' },
          'Biriktirilgan testlar: ',
          el('strong', { className: 'text-slate-800 dark:text-slate-200' }, assignedTests, ' ta')
        ),
        view4(scope, cls)
      );
    })
  );
}
