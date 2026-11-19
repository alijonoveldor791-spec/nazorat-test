// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { SafeContent } from '../../components/ui/safe-content.js';
import { view18 } from './view18.js';
export function view19(scope) {
  return el(
    'div',
    { className: 'space-y-4' },
    el('input', {
      type: 'search',
      value: scope.inspectSearch,
      onChange: (e) => scope.setInspectSearch(e.target.value),
      placeholder: 'Savol matnidan qidirish...',
      className:
        'w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
    }),
    el(
      'div',
      { className: 'space-y-3' },
      (scope.inspectTopicData.questions || [])
        .filter((q) => q.q.toLowerCase().includes(scope.inspectSearch.toLowerCase()))
        .map((q) =>
          el(
            'div',
            {
              key: q.id,
              className: 'rounded-xl border border-slate-200 p-4 text-sm space-y-2 dark:border-slate-800',
            },
            el(
              'div',
              { className: 'text-slate-900 dark:text-white' },
              el(SafeContent, { content: q.q, format: q.contentFormat })
            ),
            el(
              'div',
              { className: 'flex items-center justify-between pt-2 text-xs' },
              el(
                'span',
                { className: q.archived ? 'text-amber-600' : 'text-emerald-600' },
                q.archived ? 'Arxivlangan' : 'Faol'
              ),
              view18(scope, q)
            )
          )
        )
    )
  );
}
