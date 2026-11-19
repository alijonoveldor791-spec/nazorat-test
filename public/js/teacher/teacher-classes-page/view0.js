// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Search } from '../../components/icons.js';
export function view0(scope) {
  return el(
    'div',
    {
      className:
        'flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'relative min-w-[200px] flex-1' },
      el(Search, {
        className: 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400',
      }),
      el('input', {
        type: 'search',
        value: scope.query,
        onChange: (e) => {
          scope.setQuery(e.target.value);
          scope.setSelectedIds(new Set());
        },
        placeholder: "Nom bo'yicha qidirish...",
        'aria-label': 'Sinf yoki guruh qidirish',
        className:
          'w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    el(
      'select',
      {
        value: scope.kindFilter,
        onChange: (e) => {
          const next = e.target.value;
          scope.setKindFilter(next);
          if (next === 'class') scope.setDirectionFilter('');
          scope.setSelectedIds(new Set());
        },
        'aria-label': 'Sinf yoki guruh turi',
        className:
          'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el('option', { value: '' }, 'Sinflar va guruhlar'),
      el('option', { value: 'class' }, 'Faqat sinflar'),
      el('option', { value: 'group' }, 'Faqat guruhlar')
    ),
    el(
      'select',
      {
        value: scope.directionFilter,
        disabled: scope.kindFilter === 'class',
        onChange: (e) => {
          scope.setDirectionFilter(e.target.value);
          scope.setSelectedIds(new Set());
        },
        'aria-label': "Yo'nalish filtri",
        className:
          'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el('option', { value: '' }, "Barcha yo'nalishlar"),
      scope.directions.map((d) => el('option', { key: d, value: d }, d))
    ),
    (scope.query || scope.kindFilter || scope.directionFilter) &&
      el(
        'button',
        {
          type: 'button',
          onClick: () => {
            scope.setQuery('');
            scope.setKindFilter('');
            scope.setDirectionFilter('');
            scope.setSelectedIds(new Set());
          },
          className:
            'rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
        },
        'Filtrlarni tozalash'
      )
  );
}
