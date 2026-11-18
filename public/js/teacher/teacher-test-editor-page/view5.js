// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view5(scope) {
  return el(
    'div',
    { className: 'flex flex-wrap gap-5 pt-1' },
    el(
      'label',
      {
        className: 'inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200',
      },
      el('input', {
        type: 'checkbox',
        checked: scope.shuffleQuestions,
        onChange: (e) => scope.setShuffleQuestions(e.target.checked),
        className: 'h-4 w-4 rounded border-slate-300 text-blue-600',
      }),
      el('span', null, 'Savollarni aralashtirish')
    ),
    el(
      'label',
      {
        className: 'inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200',
      },
      el('input', {
        type: 'checkbox',
        checked: scope.shuffleOptions,
        onChange: (e) => scope.setShuffleOptions(e.target.checked),
        className: 'h-4 w-4 rounded border-slate-300 text-blue-600',
      }),
      el('span', null, 'Variantlarni aralashtirish')
    ),
    el(
      'label',
      {
        className: 'inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200',
      },
      el('input', {
        type: 'checkbox',
        checked: scope.showAnswers,
        onChange: (e) => scope.setShowAnswers(e.target.checked),
        className: 'h-4 w-4 rounded border-slate-300 text-blue-600',
      }),
      el('span', null, "Yakunlangach to'g'ri javoblarni ko'rsatish")
    )
  );
}
