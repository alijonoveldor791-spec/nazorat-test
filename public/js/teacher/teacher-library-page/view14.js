// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { BookOpen } from '../../components/icons.js';
import { view13 } from './view13.js';
export function view14(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'flex flex-wrap items-center justify-between gap-3' },
      el(
        'div',
        { className: 'flex items-center gap-2' },
        el(BookOpen, { className: 'h-5 w-5 text-blue-600 dark:text-blue-400' }),
        el(
          'h2',
          { className: 'font-display text-lg font-bold text-slate-900 dark:text-white' },
          'Umumiy tayyor test banki'
        )
      ),
      scope.bankAccess.permissions?.view &&
        el('input', {
          type: 'search',
          value: scope.bankQuery,
          onChange: (e) => scope.setBankQuery(e.target.value),
          placeholder: 'Umumiy testlardan qidirish...',
          className:
            'rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        })
    ),
    !scope.bankAccess.permissions?.view
      ? el(
          'p',
          { className: 'text-sm text-slate-500 dark:text-slate-400' },
          'Joriy tarifingizda umumiy bank yopiq.'
        )
      : el(
          'div',
          { className: 'grid gap-3 md:grid-cols-2' },
          scope.sharedTests
            .filter((st) => `${st.title} ${st.subject}`.toLowerCase().includes(scope.bankQuery.toLowerCase()))
            .map((st) =>
              el(
                'article',
                {
                  key: st.id,
                  className: 'rounded-xl border border-slate-200 p-4 space-y-3 dark:border-slate-800',
                },
                el(
                  'div',
                  null,
                  el('h3', { className: 'font-semibold text-slate-900 dark:text-white' }, st.title),
                  el(
                    'p',
                    { className: 'text-xs text-slate-500 dark:text-slate-400' },
                    st.subject,
                    ' \u00B7 ',
                    st.count ?? st.questions?.length ?? 0,
                    ' savol'
                  )
                ),
                view13(scope, st)
              )
            )
        )
  );
}
