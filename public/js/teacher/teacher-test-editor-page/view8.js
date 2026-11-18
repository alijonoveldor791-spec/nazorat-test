// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Plus } from '../../components/icons.js';
export function view8(scope) {
  return el(
    'div',
    { className: 'flex flex-wrap items-center justify-between gap-3' },
    el(
      'h2',
      { className: 'font-display text-lg font-semibold text-slate-900 dark:text-white' },
      'Savollar (',
      scope.questions.length,
      ' ta)'
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => {
          if (scope.questions.length >= 200) {
            scope.toast('200 savoldan oshmasin.', true);
            return;
          }
          scope.setQuestions((prev) => [...prev, { q: '', options: ['', ''], answer: 0 }]);
        },
        className:
          'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(Plus, { className: 'h-3.5 w-3.5' }),
      el('span', null, "Savol qo'shish")
    )
  );
}
