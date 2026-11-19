// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
export function view3(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'flex flex-wrap items-start justify-between gap-4' },
      el(
        'div',
        null,
        el(
          'p',
          { className: 'text-xs font-medium text-slate-500 dark:text-slate-400' },
          scope.identity.surname,
          ' ',
          scope.identity.name,
          ' \u00B7 ',
          scope.identity.grade
        ),
        el(
          'h1',
          { className: 'mt-1 font-display text-2xl font-bold text-slate-900 sm:text-3xl dark:text-white' },
          scope.title
        )
      ),
      view1(scope)
    ),
    view2(scope),
    el(
      'p',
      { className: 'mt-4 text-sm text-slate-600 dark:text-slate-300' },
      scope.percent >= 86
        ? "Ajoyib natija! Shu sur'atda davom eting."
        : scope.percent >= 60
          ? 'Yaxshi! Yana mashq qilsangiz, yanada yuqori natijaga erishasiz.'
          : 'Har bir urinish bilimni oshiradi. Mashq qilishda davom eting.'
    ),
    scope.result.timedOut &&
      el(
        'p',
        { className: 'mt-2 text-xs text-amber-700 dark:text-amber-300' },
        'Vaqt tugadi. Serverga muddatida yetib borgan javoblar baholandi.'
      )
  );
}
