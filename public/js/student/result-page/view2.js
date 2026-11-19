// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { resultScore } from '../../core/format.js';
export function view2(scope) {
  return el(
    'div',
    { className: 'mt-6 grid gap-4 border-t border-slate-200 pt-6 sm:grid-cols-3 dark:border-slate-800' },
    el(
      'div',
      { className: 'rounded-xl bg-slate-50 p-4 dark:bg-slate-950' },
      el('p', { className: 'text-xs text-slate-500 dark:text-slate-400' }, 'Umumiy ball'),
      el(
        'p',
        { className: 'mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white' },
        resultScore(scope.result)
      )
    ),
    el(
      'div',
      { className: 'rounded-xl bg-slate-50 p-4 dark:bg-slate-950' },
      el('p', { className: 'text-xs text-slate-500 dark:text-slate-400' }, "Foiz ko'rsatkichi"),
      el(
        'p',
        { className: 'mt-1 font-mono text-2xl font-bold tabular-nums text-blue-600 dark:text-blue-400' },
        scope.percent,
        '%'
      )
    ),
    el(
      'div',
      { className: 'rounded-xl bg-slate-50 p-4 dark:bg-slate-950' },
      el('p', { className: 'text-xs text-slate-500 dark:text-slate-400' }, "To'g'ri / Xato"),
      el(
        'p',
        { className: 'mt-1 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white' },
        el('span', { className: 'text-emerald-600 dark:text-emerald-400' }, scope.correct),
        ' /',
        ' ',
        el('span', { className: 'text-red-600 dark:text-red-400' }, scope.wrong)
      )
    )
  );
}
