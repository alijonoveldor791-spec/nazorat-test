// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view7 } from './view7.js';
import { view8 } from './view8.js';
export function view9(scope) {
  return el(
    'div',
    { className: scope.viewMode === 'cards' ? 'grid gap-4 md:grid-cols-2' : 'space-y-3' },
    scope.visibleTests.map((test) => {
      const assignedClasses = test.classIds.map(
        (id) => scope.classMap.get(id) || { id, name: 'Eski sinf', kind: 'class' }
      );
      const regularNames = assignedClasses
        .filter((c) => c.kind !== 'group')
        .map((c) => c.name)
        .join(', ');
      const groupNames = assignedClasses
        .filter((c) => c.kind === 'group')
        .map((c) => c.name)
        .join(', ');
      const qCount = test.count ?? test.questionCount ?? test.questions?.length ?? 0;
      const statusColor =
        test.status === 'active'
          ? 'text-emerald-700 dark:text-emerald-400'
          : test.status === 'scheduled'
            ? 'text-blue-700 dark:text-blue-400'
            : 'text-slate-500 dark:text-slate-400';
      return el(
        'article',
        {
          key: test.id,
          className:
            'flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700',
        },
        view7(scope, test, statusColor, regularNames, groupNames, qCount),
        view8(scope, test)
      );
    })
  );
}
