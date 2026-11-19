// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { EmptyState } from '../../components/ui/empty-state.js';
import { formatScore } from '../../core/format.js';
import { view9 } from './view9.js';
import { view10 } from './view10.js';
export function view11(scope) {
  return el(
    'div',
    { className: 'space-y-4' },
    view9(scope),
    scope.detailRow.sections &&
      scope.detailRow.sections.length > 0 &&
      el(
        'div',
        { className: 'grid gap-2 sm:grid-cols-2' },
        scope.detailRow.sections.map((sec, idx) =>
          el(
            'div',
            {
              key: idx,
              className:
                'flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm dark:border-slate-800',
            },
            el(
              'div',
              null,
              el('p', { className: 'font-medium text-slate-900 dark:text-white' }, sec.subject),
              el('p', { className: 'text-xs text-slate-500 dark:text-slate-400' }, sec.type)
            ),
            el(
              'span',
              { className: 'font-semibold tabular-nums text-slate-900 dark:text-white' },
              formatScore(sec.score),
              ' / ',
              formatScore(sec.maxScore ?? sec.total)
            )
          )
        )
      ),
    scope.detailRow.questions?.length
      ? el(
          'div',
          { className: 'space-y-3' },
          scope.detailRow.questions.map((q, idx) => {
            const chosen = scope.detailRow.answers?.[idx] ?? null;
            const isCorrect = chosen === q.answer;
            return view10(scope, idx, q, isCorrect, chosen);
          })
        )
      : el(EmptyState, {
          title: 'Batafsil javoblar saqlanmagan',
          description: "Eski natija: ball va foiz to'liq ko'rsatilgan.",
        })
  );
}
