// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { SafeContent } from '../../components/ui/safe-content.js';
import { percent } from '../../core/format.js';
import { LETTERS } from './shared.js';
export function view12(scope) {
  return el(
    'div',
    { className: 'space-y-3' },
    el('h3', { className: 'text-sm font-semibold text-slate-900 dark:text-white' }, 'Barcha savollar'),
    scope.analysisData.questions.map((q) =>
      el(
        'div',
        {
          key: q.index,
          className: 'rounded-xl border border-slate-200 p-4 text-xs space-y-2 dark:border-slate-800',
        },
        el(
          'div',
          { className: 'font-semibold text-sm text-slate-900 dark:text-white' },
          q.index + 1,
          '. ',
          el(SafeContent, { content: q.q, format: q.contentFormat, inline: true })
        ),
        el(
          'p',
          { className: 'text-slate-700 dark:text-slate-200' },
          "To'g'ri javob: ",
          el('strong', { className: 'tabular-nums' }, q.percent, '%'),
          ' \u00B7 ',
          q.count,
          ' javob'
        ),
        el(
          'p',
          { className: 'text-slate-500 dark:text-slate-400' },
          q.distribution.map((n, idx) => `${LETTERS[idx]}: ${n}`).join(' · '),
          ' \u00B7 Javobsiz:',
          ' ',
          q.unanswered
        )
      )
    )
  );
}
