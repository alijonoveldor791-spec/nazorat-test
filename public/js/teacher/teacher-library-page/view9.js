// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view9(scope, i, t, qCount, own) {
  return el(
    'div',
    null,
    el(
      'div',
      { className: 'flex items-center gap-2 text-xs' },
      el(
        'span',
        { className: 'font-mono text-slate-400' },
        String((scope.currentSavedPage - 1) * scope.testPageSize + i + 1).padStart(2, '0'),
        '.'
      ),
      el(
        'span',
        {
          className: `font-semibold ${t.active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`,
        },
        t.active ? 'Faol' : 'Qoralama'
      ),
      t.testCode?.value &&
        el(
          'span',
          { className: 'font-mono text-slate-700 dark:text-slate-200' },
          '\u00B7 Kod: ',
          t.testCode.value
        )
    ),
    el('h3', { className: 'mt-1 font-display text-base font-bold text-slate-900 dark:text-white' }, t.title),
    el(
      'p',
      { className: 'text-xs text-slate-500 dark:text-slate-400' },
      qCount,
      ' savol \u00B7',
      ' ',
      t.libraryQuarters?.length ? `${t.libraryQuarters.join(', ')}-chorak · ` : '',
      t.composition?.topics?.map((v) => `${v.name} (${v.count})`).join(', ') ||
        (own ? 'Maktab testi' : 'Umumiy bank nusxasi')
    )
  );
}
