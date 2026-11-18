// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view2(scope) {
  return el(
    'section',
    {
      className: 'grid grid-cols-2 gap-4 border-y border-slate-200 py-8 sm:grid-cols-4 dark:border-slate-800',
    },
    el(
      'div',
      null,
      el(
        'p',
        { className: 'font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white' },
        '4 qadam'
      ),
      el('p', { className: 'mt-1 text-sm text-slate-500 dark:text-slate-400' }, 'Akkauntsiz tezkor kirish')
    ),
    el(
      'div',
      null,
      el(
        'p',
        { className: 'font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white' },
        '189 ball'
      ),
      el('p', { className: 'mt-1 text-sm text-slate-500 dark:text-slate-400' }, 'DTM standart blok baholash')
    ),
    el(
      'div',
      null,
      el(
        'p',
        { className: 'font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white' },
        'MathML'
      ),
      el(
        'p',
        { className: 'mt-1 text-sm text-slate-500 dark:text-slate-400' },
        'Word formulalarni aniq chiqarish'
      )
    ),
    el(
      'div',
      null,
      el(
        'p',
        { className: 'font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-white' },
        '100%'
      ),
      el(
        'p',
        { className: 'mt-1 text-sm text-slate-500 dark:text-slate-400' },
        'Server vaqti va natija nazorati'
      )
    )
  );
}
