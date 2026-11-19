// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { SafeContent } from '../../components/ui/safe-content.js';
export function view3(scope, idx, selected, letter, opt) {
  return el(
    'label',
    {
      key: idx,
      className: `flex cursor-pointer items-start gap-3.5 rounded-xl border p-4 transition-colors ${
        selected
          ? 'border-blue-600 bg-blue-50/70 dark:border-blue-500 dark:bg-blue-950/40'
          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 dark:border-slate-800 dark:bg-slate-950/60 dark:hover:border-slate-700'
      } ${scope.locked ? 'cursor-not-allowed opacity-70' : ''}`,
    },
    el('input', {
      type: 'radio',
      name: `q-${scope.state.current}`,
      value: idx,
      checked: selected,
      disabled: scope.locked,
      onChange: () => scope.selectAnswer(idx),
      className: 'sr-only',
    }),
    el(
      'span',
      {
        className: `flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold ${
          selected
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
        }`,
      },
      letter
    ),
    el(
      'div',
      {
        className:
          'min-w-0 flex-1 pt-0.5 text-sm leading-relaxed text-slate-800 sm:text-base dark:text-slate-200',
      },
      el(SafeContent, { value: opt, format: scope.question.contentFormat })
    )
  );
}
