// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { Building2 } from '../../icons.js';
export function view0(scope) {
  return el(
    'div',
    null,
    el(
      'div',
      { className: 'flex items-center gap-2 text-xs' },
      el(Building2, { className: 'h-4 w-4 text-blue-600 dark:text-blue-400' }),
      el(
        'span',
        {
          className: `font-semibold ${
            scope.school.status === 'blocked'
              ? 'text-red-600 dark:text-red-400'
              : 'text-emerald-700 dark:text-emerald-400'
          }`,
        },
        scope.school.status === 'blocked' ? 'Bloklangan' : 'Faol'
      ),
      scope.school.adminLogin &&
        el(
          'span',
          { className: 'text-slate-500 dark:text-slate-400' },
          '\u00B7 Admin: ',
          scope.school.adminLogin
        )
    ),
    el(
      'h3',
      { className: 'mt-1 font-display text-lg font-bold text-slate-900 dark:text-white' },
      scope.school.name
    ),
    scope.counts &&
      el(
        'p',
        { className: 'mt-0.5 text-xs text-slate-500 dark:text-slate-400' },
        scope.counts.classes,
        ' sinf \u00B7 ',
        scope.counts.tests,
        ' test \u00B7 ',
        scope.counts.attempts,
        ' urinish \u00B7 ',
        scope.counts.results,
        ' ',
        'natija'
      )
  );
}
