// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { SafeContent } from '../../components/ui/safe-content.js';
import { LETTERS } from './shared.js';
export function view23(scope, i, q) {
  return el(
    'article',
    { key: i, className: 'rounded-xl border border-slate-200 p-4 text-sm space-y-2 dark:border-slate-800' },
    el(
      'div',
      { className: 'font-semibold text-slate-900 dark:text-white' },
      i + 1,
      '. ',
      el(SafeContent, { content: q.q, format: q.contentFormat, inline: true })
    ),
    el(
      'div',
      { className: 'space-y-1 text-xs text-slate-700 dark:text-slate-300' },
      q.options.map((opt, j) =>
        el(
          'p',
          { key: j, className: q.answer === j ? 'font-semibold text-emerald-700 dark:text-emerald-400' : '' },
          q.answer === j ? "To'g'ri: " : '',
          LETTERS[j],
          '. ',
          el(SafeContent, { content: opt, format: q.contentFormat, inline: true })
        )
      )
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: scope.draftBusy,
        onClick: () => scope.handleReplaceDraftQuestion(i),
        className:
          'rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200',
      },
      'Shu mavzudan almashtirish'
    )
  );
}
