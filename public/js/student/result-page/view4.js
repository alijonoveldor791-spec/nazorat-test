// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { formatScore } from '../../core/format.js';
export function view4(scope) {
  return el(
    'section',
    { className: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' },
    scope.result.sections.map((sec, i) =>
      el(
        'article',
        {
          key: i,
          className:
            'rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900',
        },
        el('p', { className: 'text-xs text-slate-500 dark:text-slate-400' }, sec.type),
        el(
          'h2',
          { className: 'mt-1 font-display text-base font-semibold text-slate-900 dark:text-white' },
          sec.subject
        ),
        el(
          'p',
          { className: 'mt-3 font-mono text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400' },
          formatScore(sec.score),
          ' / ',
          formatScore(sec.maxScore ?? sec.total)
        ),
        el(
          'p',
          { className: 'mt-1 text-xs tabular-nums text-slate-500 dark:text-slate-400' },
          "To'g'ri: ",
          sec.correctCount ?? sec.score,
          ' / ',
          sec.total
        )
      )
    )
  );
}
