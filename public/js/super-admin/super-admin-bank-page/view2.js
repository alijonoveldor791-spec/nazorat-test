// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { EmptyState } from '../../components/ui/empty-state.js';
export function view2(scope) {
  return el(
    'section',
    { className: 'space-y-4 lg:col-span-7' },
    el(
      'h2',
      { className: 'font-display text-lg font-bold text-slate-900 dark:text-white' },
      'Moderatsiya navbati (',
      scope.queue.length,
      ')'
    ),
    scope.loading
      ? el(
          'div',
          { className: 'space-y-3' },
          [0, 1].map((i) =>
            el('div', {
              key: i,
              className:
                'h-28 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
            })
          )
        )
      : scope.queue.length === 0
        ? el(EmptyState, {
            title: "Yuborilgan test yo'q",
            description: "O'qituvchilar tomonidan umumiy bankka ulashilgan testlar shu yerda ko'rinadi.",
          })
        : el(
            'div',
            { className: 'space-y-3' },
            scope.queue.map((t) =>
              el(
                'article',
                {
                  key: t.id,
                  className:
                    'flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900',
                },
                el(
                  'div',
                  null,
                  el(
                    'h3',
                    { className: 'font-display text-base font-bold text-slate-900 dark:text-white' },
                    t.title
                  ),
                  el(
                    'p',
                    { className: 'mt-0.5 text-xs text-slate-500 dark:text-slate-400' },
                    t.subject,
                    ' \u00B7 ',
                    t.questions.length,
                    ' savol \u00B7 Holat: ',
                    t.status
                  )
                ),
                el(
                  'button',
                  {
                    type: 'button',
                    onClick: () => scope.openReview(t),
                    className:
                      'rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700',
                  },
                  "Ko'rib chiqish"
                )
              )
            )
          )
  );
}
