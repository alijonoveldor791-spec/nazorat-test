// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { KeyRound } from '../../components/icons.js';
import { CODE_STATE_LABELS } from './shared.js';
import { view5 } from './view5.js';
export function view6(scope, test) {
  return el(
    'div',
    {
      className:
        'rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60',
    },
    el(
      'div',
      { className: 'flex items-center justify-between gap-2 text-xs' },
      el(
        'span',
        { className: 'flex items-center gap-1.5 font-medium text-slate-600 dark:text-slate-300' },
        el(KeyRound, { className: 'h-3.5 w-3.5' }),
        el('span', null, 'Umumiy test kodi')
      ),
      el(
        'span',
        {
          className: `font-semibold ${
            test.testCode.state === 'active'
              ? 'text-emerald-700 dark:text-emerald-400'
              : test.testCode.state === 'revoked'
                ? 'text-red-600 dark:text-red-400'
                : 'text-slate-500 dark:text-slate-400'
          }`,
        },
        CODE_STATE_LABELS[test.testCode.state] || test.testCode.state
      )
    ),
    el(
      'div',
      { className: 'mt-2 flex flex-wrap items-center justify-between gap-2' },
      el(
        'strong',
        { className: 'font-mono text-lg font-bold tracking-wider text-slate-900 dark:text-white' },
        test.testCode.value
      ),
      view5(scope, test)
    )
  );
}
