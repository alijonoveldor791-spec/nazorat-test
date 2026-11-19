// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view3(scope) {
  return el(
    'ol',
    { className: 'grid gap-6 md:grid-cols-3' },
    el(
      'li',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900',
      },
      el(
        'span',
        { className: 'font-mono text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400' },
        '01. Kodlarni kiriting'
      ),
      el(
        'h3',
        { className: 'mt-3 font-display text-lg font-semibold text-slate-900 dark:text-white' },
        'Maktab IDsi va test kodi'
      ),
      el(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300' },
        "O'qituvchingiz bergan maktab identifikatori (masalan, SK-1001) va 6 raqamli umumiy kodni kiriting."
      )
    ),
    el(
      'li',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900',
      },
      el(
        'span',
        { className: 'font-mono text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400' },
        '02. Shaxsingizni tanlang'
      ),
      el(
        'h3',
        { className: 'mt-3 font-display text-lg font-semibold text-slate-900 dark:text-white' },
        'Sinf va ism-familiya'
      ),
      el(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300' },
        'Testga biriktirilgan sinf yoki guruhingizni tanlab, ism-familiyangizni kiriting va tasdiqlang.'
      )
    ),
    el(
      'li',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900',
      },
      el(
        'span',
        { className: 'font-mono text-sm font-semibold tabular-nums text-blue-600 dark:text-blue-400' },
        '03. Testni yeching'
      ),
      el(
        'h3',
        { className: 'mt-3 font-display text-lg font-semibold text-slate-900 dark:text-white' },
        'Savollar xaritasi va natija'
      ),
      el(
        'p',
        { className: 'mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-300' },
        "Savollar orasida erkin harakatlaning, ikkilangan savollarni belgilang va yakunda batafsil natijani ko'ring."
      )
    )
  );
}
