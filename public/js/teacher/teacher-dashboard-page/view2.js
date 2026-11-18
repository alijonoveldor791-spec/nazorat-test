// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { LoadingState } from '../../components/ui/loading-state.js';
import { el } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { ArrowRight } from '../../components/icons.js';
import { EmptyState } from '../../components/ui/empty-state.js';
import { view1 } from './view1.js';
export function view2(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 lg:col-span-7 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'mb-4 flex items-center justify-between gap-3' },
      el(
        'div',
        null,
        el(
          'h2',
          { className: 'font-display text-lg font-semibold text-slate-900 dark:text-white' },
          'Oxirgi natijalar'
        ),
        el('p', { className: 'text-xs text-slate-500 dark:text-slate-400' }, "Eng so'nggi 5 ta topshirish")
      ),
      el(
        Link,
        {
          to: '/oqituvchi/natijalar',
          className:
            'inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap dark:text-blue-400',
        },
        el('span', null, "Barchasini ko'rish"),
        el(ArrowRight, { className: 'h-4 w-4' })
      )
    ),
    scope.loading
      ? el(LoadingState, { label: "Ma'lumotlar yuklanmoqda..." })
      : scope.recentResults.length === 0
        ? el(EmptyState, {
            title: "Hali topshirishlar yo'q",
            description: "O'quvchilar test topshirganidan keyin eng so'nggi natijalar shu yerda ko'rinadi.",
          })
        : el(
            'div',
            { className: 'overflow-x-auto' },
            el(
              'table',
              { className: 'w-full text-left text-sm' },
              el(
                'thead',
                null,
                el(
                  'tr',
                  {
                    className:
                      'border-b border-slate-200 text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:text-slate-400',
                  },
                  el('th', { className: 'pb-3 pr-3' }, "O'quvchi"),
                  el('th', { className: 'pb-3 pr-3' }, 'Test'),
                  el('th', { className: 'pb-3 pr-3 text-right' }, 'Ball'),
                  el('th', { className: 'pb-3 text-right' }, 'Amal')
                )
              ),
              el(
                'tbody',
                { className: 'divide-y divide-slate-100 dark:divide-slate-800/80' },
                scope.recentResults.map((row) => view1(scope, row))
              )
            )
          )
  );
}
