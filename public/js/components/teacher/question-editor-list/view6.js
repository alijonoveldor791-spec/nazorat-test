// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { LETTERS } from './shared.js';
import { view4 } from './view4.js';
import { view5 } from './view5.js';
export function view6(scope, isRich, q, i, history) {
  return el(
    'div',
    { className: 'space-y-2.5' },
    el(
      'p',
      { className: 'text-xs text-slate-500 dark:text-slate-400' },
      "To'g'ri variant yonidagi doirani belgilang.",
      isRich ? " Rasmni bosib o'lchamini o'zgartirish yoki o'chirish mumkin." : ''
    ),
    q.options.map((opt, j) =>
      el(
        'div',
        { key: j, className: 'flex items-start gap-2.5' },
        el('input', {
          type: 'radio',
          name: `correct-q-${i}`,
          checked: (q.answer ?? 0) === j,
          onChange: () => scope.updateQuestion(i, (item) => ({ ...item, answer: j })),
          'aria-label': `${i + 1}-savol ${LETTERS[j]} to'g'ri javob`,
          className: 'mt-3 h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-blue-500',
        }),
        el(
          'span',
          { className: 'mt-2.5 w-5 shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300' },
          LETTERS[j]
        ),
        view4(scope, isRich, opt, i, j)
      )
    ),
    view5(scope, q, i, history)
  );
}
