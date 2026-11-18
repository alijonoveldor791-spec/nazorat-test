// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { BarChart3 } from '../../components/icons.js';
export function view3(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'mb-4 flex items-center justify-between gap-2' },
      el(
        'h2',
        { className: 'font-display text-lg font-semibold text-slate-900 dark:text-white' },
        "Sinflar bo'yicha o'rtacha foiz"
      ),
      el(BarChart3, { className: 'h-4 w-4 text-slate-400' })
    ),
    scope.loading
      ? el(
          'div',
          { className: 'space-y-3' },
          [0, 1, 2].map((i) =>
            el('div', { key: i, className: 'h-8 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800' })
          )
        )
      : scope.classChartData.length === 0
        ? el(
            'p',
            { className: 'py-8 text-center text-sm text-slate-500 dark:text-slate-400' },
            'Grafik uchun natijalar yetarli emas.'
          )
        : el(
            'div',
            { className: 'space-y-3.5' },
            scope.classChartData.map((item) =>
              el(
                'div',
                { key: item.name, className: 'space-y-1.5' },
                el(
                  'div',
                  { className: 'flex items-center justify-between text-xs font-medium' },
                  el(
                    'span',
                    { className: 'truncate text-slate-700 dark:text-slate-200' },
                    item.name,
                    ' ',
                    el('span', { className: 'text-slate-400' }, '(', item.count, ')')
                  ),
                  el(
                    'span',
                    { className: 'tabular-nums font-semibold text-slate-900 dark:text-white' },
                    item.avg,
                    '%'
                  )
                ),
                el(
                  'div',
                  { className: 'h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800' },
                  el('div', {
                    className: 'h-full rounded-full bg-blue-600 transition-all duration-300 dark:bg-blue-500',
                    style: { width: `${Math.max(4, item.avg)}%` },
                  })
                )
              )
            )
          ),
    el(
      'p',
      { className: 'mt-5 text-xs text-slate-500 dark:text-slate-400' },
      'Har bir sinf yoki guruhning topshirishlari asosida hisoblanadi.'
    )
  );
}
