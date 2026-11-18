// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { SafeContent } from '../../components/ui/safe-content.js';
import { percent } from '../../core/format.js';
import { view12 } from './view12.js';
export function view13(scope) {
  return el(
    'div',
    { className: 'space-y-5' },
    el(
      'div',
      {
        className:
          'rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-800 dark:bg-slate-950/60',
      },
      el(
        'p',
        { className: 'font-semibold text-slate-900 dark:text-white' },
        scope.analysisData.title,
        ' \u00B7 ',
        scope.analysisData.attempts,
        ' ta batafsil natija'
      ),
      el(
        'p',
        { className: 'mt-1 text-xs text-slate-500 dark:text-slate-400' },
        'Eski, javoblari saqlanmagan va boshqa tahrirdagi natijalar hisobga kiritilmaydi.'
      )
    ),
    scope.analysisData.hardest.length > 0 &&
      el(
        'div',
        { className: 'space-y-2' },
        el('h3', { className: 'text-sm font-semibold text-slate-900 dark:text-white' }, 'Eng qiyin 5 savol'),
        el(
          'div',
          { className: 'space-y-2' },
          scope.analysisData.hardest.map((q) =>
            el(
              'div',
              {
                key: q.index,
                className:
                  'flex items-start justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-2.5 text-xs dark:border-slate-800',
              },
              el(
                'div',
                { className: 'min-w-0 text-slate-700 dark:text-slate-200' },
                el('span', { className: 'font-semibold' }, q.index + 1, '.'),
                ' ',
                el(SafeContent, { content: q.q, format: q.contentFormat, inline: true })
              ),
              el(
                'span',
                { className: 'font-bold tabular-nums text-red-600 shrink-0 dark:text-red-400' },
                q.percent,
                '%'
              )
            )
          )
        )
      ),
    view12(scope)
  );
}
