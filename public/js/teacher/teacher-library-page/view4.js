// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { EmptyState } from '../../components/ui/empty-state.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
import { view3 } from './view3.js';
export function view4(scope) {
  return el(
    'section',
    { className: 'space-y-4 lg:col-span-7' },
    view1(scope),
    el(
      'div',
      { className: 'flex items-center justify-between text-xs text-slate-500 dark:text-slate-400' },
      el('span', { className: 'font-medium uppercase tracking-wider' }, 'Mavzular'),
      el('span', { className: 'tabular-nums' }, scope.visibleTopics.length, ' ta mavzu')
    ),
    scope.loading
      ? el(
          'div',
          { className: 'space-y-3' },
          [0, 1, 2].map((i) =>
            el('div', {
              key: i,
              className:
                'h-28 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
            })
          )
        )
      : scope.visibleTopics.length === 0
        ? el(EmptyState, {
            title: 'Mavzu topilmadi',
            description: 'Yangi mavzu yarating yoki filtrlarni tozalang.',
          })
        : el(
            'div',
            { className: 'space-y-3' },
            scope.visibleTopics.map((topic, idx) => {
              const chosen = scope.selectedTopicIds.has(topic.id);
              return el(
                'article',
                {
                  key: topic.id,
                  className: `rounded-2xl border p-4 transition-colors ${
                    chosen
                      ? 'border-blue-500 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/20'
                      : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                  }`,
                },
                view2(scope, idx, topic),
                view3(scope, chosen, topic)
              );
            })
          )
  );
}
