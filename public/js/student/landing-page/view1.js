// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { HERO_IMG } from './shared.js';
export function view1(scope) {
  return el(
    'div',
    {
      className:
        'relative h-full min-h-[280px] overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-900',
    },
    el('img', {
      src: HERO_IMG,
      alt: "Zamonaviy o'quv zalida raqamli test yechayotgan o'quvchi",
      referrerPolicy: 'no-referrer',
      className: 'h-full w-full object-cover',
    }),
    el('div', {
      className: 'absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/15 to-transparent',
    }),
    el(
      'div',
      { className: 'absolute right-6 bottom-6 left-6 text-white' },
      el(
        'p',
        { className: 'text-xs font-medium text-slate-200' },
        'Oddiy testlar \u00B7 DTM 189 balli blok tizim \u00B7 Word formulalar'
      ),
      el(
        'p',
        { className: 'mt-1 font-display text-xl font-semibold' },
        "Har bir urinish o'sish va aniq tahlil sari qadam"
      )
    )
  );
}
