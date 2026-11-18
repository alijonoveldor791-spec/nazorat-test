// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Clock, LayoutGrid, Send } from '../../components/icons.js';
import { formatCountdown } from '../../core/format.js';
export function view1(scope) {
  return el(
    'div',
    { className: 'flex items-center gap-3 shrink-0' },
    scope.remainingMs !== null &&
      el(
        'div',
        {
          className: `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ${
            scope.urgentTimer
              ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/60 dark:text-red-300'
              : 'border-slate-200 bg-slate-50 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100'
          }`,
        },
        el(Clock, { className: 'h-4 w-4' }),
        el('span', null, formatCountdown(scope.remainingMs))
      ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.setMapOpenMobile((v) => !v),
        className:
          'inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium lg:hidden dark:border-slate-700',
      },
      el(LayoutGrid, { className: 'h-4 w-4' }),
      el('span', null, scope.answeredCount, '/', scope.state.questions.length)
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: scope.locked && !scope.state.pendingSubmit,
        onClick: () => (scope.state.pendingSubmit ? scope.submitFinal(true) : scope.setConfirmFinish(true)),
        className:
          'inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50 sm:text-sm',
      },
      el(Send, { className: 'h-3.5 w-3.5' }),
      el('span', null, scope.state.pendingSubmit ? 'Qayta yuborish' : 'Yakunlash')
    )
  );
}
