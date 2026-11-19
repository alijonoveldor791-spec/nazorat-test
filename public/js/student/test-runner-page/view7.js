// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { sectionMap } from '../section-map.js';
export function view7(scope) {
  return el(
    'div',
    {
      className:
        'sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'flex items-center justify-between border-b border-slate-200 pb-3 dark:border-slate-800' },
      el('h2', { className: 'text-sm font-semibold text-slate-900 dark:text-white' }, 'Savollar xaritasi'),
      el(
        'span',
        { className: 'font-mono text-xs tabular-nums text-slate-500 dark:text-slate-400' },
        scope.answeredCount,
        ' / ',
        scope.state.questions.length
      )
    ),
    sectionMap(scope),
    el(
      'div',
      {
        className:
          'mt-5 space-y-1.5 border-t border-slate-200 pt-4 text-xs text-slate-500 dark:border-slate-800 dark:text-slate-400',
      },
      el('p', null, 'Klaviatura: 1\u20136 yoki A\u2013F variant, \u2190 / \u2192 savol'),
      el(
        'p',
        { 'aria-live': 'polite' },
        `Qoidabuzarlik: ${scope.state.violationCount || 0}/${scope.state.violationLimit ?? '—'}`
      )
    )
  );
}
