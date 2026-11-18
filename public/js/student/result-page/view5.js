// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Check, X } from '../../components/icons.js';
export function view5(scope) {
  return el(
    'section',
    { className: 'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900' },
    el(
      'h2',
      { className: 'text-sm font-semibold text-slate-900 dark:text-white' },
      "Savollar bo'yicha holat"
    ),
    el(
      'div',
      { className: 'mt-4 flex flex-wrap gap-2' },
      scope.result.results.map((ok, i) =>
        el(
          'span',
          {
            key: i,
            'aria-label': `${i + 1}-savol ${ok ? "to'g'ri" : "noto'g'ri"}`,
            className: `inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 font-mono text-xs font-semibold tabular-nums ${
              ok
                ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'border-red-200 bg-red-50 text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300'
            }`,
          },
          el('span', null, i + 1),
          ok ? el(Check, { className: 'h-3 w-3' }) : el(X, { className: 'h-3 w-3' })
        )
      )
    )
  );
}
