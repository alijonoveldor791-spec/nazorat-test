// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view6(scope, idx, isCurrent, isAnswered, flagged) {
  return el(
    'button',
    {
      key: idx,
      type: 'button',
      onClick: () => {
        scope.moveQuestion(idx);
        scope.setMapOpenMobile(false);
      },
      className: `relative flex h-10 items-center justify-center rounded-lg border font-mono text-xs font-semibold tabular-nums transition-colors ${
        isCurrent
          ? 'border-blue-600 bg-blue-600 text-white'
          : isAnswered
            ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-200'
            : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300'
      }`,
    },
    idx + 1,
    flagged &&
      el('span', {
        className: 'absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-amber-500',
        'aria-label': 'Belgilangan',
      })
  );
}
