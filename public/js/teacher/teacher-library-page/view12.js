// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { EmptyState } from '../../components/ui/empty-state.js';
import { view8 } from './view8.js';
import { view9 } from './view9.js';
import { view10 } from './view10.js';
import { view11 } from './view11.js';
export function view12(scope) {
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
        'h2',
        { className: 'font-display text-lg font-bold text-slate-900 dark:text-white' },
        'Saqlangan testlar (',
        scope.filteredSavedTests.length,
        ')'
      ),
      view8(scope)
    ),
    scope.pagedSavedTests.length === 0
      ? el(EmptyState, {
          title: 'Saqlangan test topilmadi',
          description: "Mavzulardan test qoralamasini tuzing yoki qidiruvni o'zgartiring.",
        })
      : el(
          'div',
          { className: 'space-y-3' },
          scope.pagedSavedTests.map((t, i) => {
            const own = t.origin?.type !== 'shared';
            const perms = scope.bankAccess.permissions || {};
            const qCount = t.count ?? t.questionCount ?? t.questions?.length ?? 0;
            return el(
              'article',
              {
                key: t.id,
                className: 'rounded-xl border border-slate-200 p-4 space-y-3 dark:border-slate-800',
              },
              el(
                'div',
                { className: 'flex flex-wrap items-start justify-between gap-2' },
                view9(scope, i, t, qCount, own)
              ),
              view10(scope, own, perms, t)
            );
          })
        ),
    scope.filteredSavedTests.length > 0 &&
      el(
        'div',
        {
          className:
            'flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400',
        },
        el(
          'span',
          { className: 'tabular-nums' },
          'Sahifa ',
          scope.currentSavedPage,
          ' / ',
          scope.savedPages,
          ' \u00B7 Jami ',
          scope.filteredSavedTests.length,
          ' ta'
        ),
        view11(scope)
      )
  );
}
