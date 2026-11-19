// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { percent, resultScore } from '../../core/format.js';
export function view5(scope) {
  return el(
    'div',
    {
      className:
        'rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60',
    },
    el(
      'p',
      { className: 'font-semibold text-slate-900 dark:text-white' },
      scope.detailRow.surname,
      ' ',
      scope.detailRow.name,
      ' \u00B7 ',
      scope.detailRow.grade
    ),
    el(
      'p',
      { className: 'mt-1 text-slate-600 dark:text-slate-300' },
      scope.detailRow.testTitle,
      ' \u00B7 ',
      resultScore(scope.detailRow),
      ' (',
      percent(scope.detailRow),
      '%)'
    ),
    el(
      'p',
      { className: 'mt-1 text-xs text-slate-500 dark:text-slate-400' },
      'Sarflangan vaqt:',
      ' ',
      scope.detailRow.durationSec === null
        ? 'Eski yozuvda saqlanmagan'
        : `${scope.detailRow.durationSec} soniya`,
      ' ',
      '\u00B7 Qoidabuzarliklar: ',
      scope.detailRow.violationCount || 0,
      scope.detailRow.terminatedViolation ? ' (Qoidabuzarlik tufayli yakunlangan)' : ''
    ),
    scope.detailRow.timedOut &&
      el(
        'p',
        { className: 'mt-1 text-xs text-amber-700 dark:text-amber-300' },
        'Vaqt tugagach serverdagi oxirgi javoblar yakunlangan.'
      )
  );
}
