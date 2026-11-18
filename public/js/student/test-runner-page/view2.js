// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Flag } from '../../components/icons.js';
export function view2(scope) {
  return el(
    'div',
    {
      className:
        'flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4 dark:border-slate-800',
    },
    el(
      'div',
      null,
      el(
        'span',
        { className: 'font-mono text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400' },
        'Savol ',
        scope.state.current + 1,
        ' / ',
        scope.state.questions.length
      ),
      scope.question.section &&
        el(
          'span',
          { className: 'ml-2 text-xs text-slate-500 dark:text-slate-400' },
          '\u00B7 ',
          scope.question.section.type,
          ' \u00B7 ',
          scope.question.section.subject
        )
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: scope.locked,
        onClick: scope.toggleFlag,
        className: `inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
          scope.isFlagged
            ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200'
            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }`,
      },
      el(Flag, { className: 'h-3.5 w-3.5' }),
      el('span', null, scope.isFlagged ? 'Belgilangan' : 'Keyinroq qaytaman')
    )
  );
}
