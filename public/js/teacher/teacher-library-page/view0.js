// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view0(scope) {
  return el(
    'div',
    { className: 'grid gap-4 sm:grid-cols-3' },
    el(
      'div',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
      },
      el('p', { className: 'text-xs font-medium text-slate-500 dark:text-slate-400' }, 'Jami baza'),
      el(
        'p',
        { className: 'mt-1 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white' },
        scope.totalBankQuestions,
        ' savol'
      )
    ),
    el(
      'div',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
      },
      el('p', { className: 'text-xs font-medium text-slate-500 dark:text-slate-400' }, 'Saqlangan testlar'),
      el(
        'p',
        { className: 'mt-1 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white' },
        scope.tests.length,
        ' ta'
      )
    ),
    el(
      'div',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
      },
      el('p', { className: 'text-xs font-medium text-slate-500 dark:text-slate-400' }, 'Faol testlar'),
      el(
        'p',
        { className: 'mt-1 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white' },
        scope.tests.filter((t) => t.active).length,
        ' ta'
      )
    )
  );
}
