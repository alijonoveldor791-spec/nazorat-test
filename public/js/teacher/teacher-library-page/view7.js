// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view6 } from './view6.js';
export function view7(scope) {
  return el(
    'div',
    {
      className:
        'sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      {
        className:
          'flex items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800',
      },
      el(
        'div',
        null,
        el(
          'h2',
          { className: 'font-display text-lg font-bold text-slate-900 dark:text-white' },
          'Tanlangan mavzular'
        ),
        el(
          'p',
          { className: 'text-xs text-slate-500 dark:text-slate-400' },
          scope.chosenTopics.length,
          ' ta mavzu tanlandi'
        )
      ),
      el(
        'strong',
        { className: 'font-display text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400' },
        scope.totalSelectedQuestions,
        ' savol'
      )
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-xs font-medium text-slate-700 dark:text-slate-300' }, 'Test nomi'),
      el('input', {
        type: 'text',
        maxLength: 100,
        value: scope.draftTitle,
        onChange: (e) => scope.setDraftTitle(e.target.value),
        placeholder: 'Test nomini kiriting',
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    scope.chosenTopics.length === 0
      ? el(
          'p',
          { className: 'py-6 text-center text-xs text-slate-500 dark:text-slate-400' },
          'Test tuzish uchun chap tarafdan mavzu tanlang.'
        )
      : el(
          'div',
          { className: 'space-y-3 max-h-[360px] overflow-y-auto pr-1' },
          scope.chosenTopics.map((t) => {
            const amt = scope.amounts[t.id] ?? 1;
            return view6(scope, t, amt);
          })
        ),
    scope.totalSelectedQuestions > 200 &&
      el(
        'p',
        { role: 'alert', className: 'text-xs font-medium text-red-600 dark:text-red-400' },
        'Jami 200 savoldan oshmasin.'
      ),
    el(
      'button',
      {
        type: 'button',
        disabled: !scope.selectionValid || scope.draftBusy,
        onClick: scope.handleComposeDraft,
        className:
          'w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50',
      },
      scope.draftBusy ? 'Tuzilmoqda...' : 'Test qoralamasini tuzish'
    )
  );
}
