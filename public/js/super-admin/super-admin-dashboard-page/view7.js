// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { LoadingState } from '../../components/ui/loading-state.js';
import { el } from '../../core/dom.js';
import { EmptyState } from '../../components/ui/empty-state.js';
import { view0 } from './view0.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
import { view3 } from './view3.js';
import { view4 } from './view4.js';
import { view5 } from './view5.js';
import { view6 } from './view6.js';
export function view7(scope) {
  return el(
    'div',
    { className: 'space-y-6' },
    view0(scope),
    el(
      'div',
      {
        className:
          'flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 dark:border-slate-800 dark:bg-slate-900',
      },
      [
        ['schools', 'Maktablar'],
        ['create', "Maktab qo'shish"],
        ['subscriptions', 'Obunalar'],
        ['statistics', 'Statistika'],
        ['settings', 'Parol sozlamasi'],
      ].map(([id, label]) =>
        el(
          'button',
          {
            key: id,
            type: 'button',
            onClick: () => scope.setTab(id),
            className: `rounded-xl px-4 py-2 text-xs font-semibold transition-colors whitespace-nowrap ${
              scope.tab === id
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`,
          },
          label
        )
      )
    ),
    scope.tab === 'schools' &&
      el(
        'div',
        { className: 'space-y-4' },
        view1(scope),
        scope.loading
          ? el(LoadingState, { label: "Ma'lumotlar yuklanmoqda..." })
          : scope.visibleSchools.length === 0
            ? el(EmptyState, { title: 'Maktab topilmadi', description: 'Qidiruv yoki filtrni tekshiring.' })
            : view2(scope)
      ),
    scope.tab === 'create' &&
      el(
        'section',
        {
          className:
            'max-w-lg rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900',
        },
        el(
          'h2',
          { className: 'font-display text-lg font-bold text-slate-900 dark:text-white' },
          "Yangi maktab qo'shish"
        ),
        view3(scope)
      ),
    scope.tab === 'subscriptions' && view4(scope),
    scope.tab === 'statistics' &&
      scope.stats &&
      el(
        'section',
        {
          className:
            'rounded-2xl border border-slate-200 bg-white overflow-hidden dark:border-slate-800 dark:bg-slate-900',
        },
        el('div', { className: 'overflow-x-auto' }, view5(scope))
      ),
    scope.tab === 'settings' && view6(scope)
  );
}
