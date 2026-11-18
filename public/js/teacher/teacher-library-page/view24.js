// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view23 } from './view23.js';
export function view24(scope) {
  return el(
    'div',
    { className: 'space-y-4' },
    el(
      'div',
      { className: 'flex flex-wrap items-end gap-3' },
      el(
        'label',
        { className: 'flex-1 space-y-1' },
        el('span', { className: 'text-xs font-medium text-slate-700 dark:text-slate-300' }, 'Test nomi'),
        el('input', {
          type: 'text',
          maxLength: 100,
          value: scope.draftReviewTitle,
          onChange: (e) => scope.setDraftReviewTitle(e.target.value),
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
        })
      ),
      el(
        'button',
        {
          type: 'button',
          disabled: scope.draftBusy,
          onClick: scope.handleRegenerateDraft,
          className:
            'rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200',
        },
        'Testni qayta tuzish'
      )
    ),
    el(
      'div',
      { className: 'space-y-3' },
      scope.draft.questions.map((q, i) => view23(scope, i, q))
    )
  );
}
