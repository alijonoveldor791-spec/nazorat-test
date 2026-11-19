// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Search } from '../../components/icons.js';
export function view1(scope) {
  return el(
    'form',
    {
      onSubmit: (e) => {
        e.preventDefault();
        scope.loadData(scope.searchQuery);
      },
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
        value: scope.searchQuery,
        onChange: (e) => scope.setSearchQuery(e.target.value),
        placeholder: 'Maktab nomi yoki IDsi...',
        className:
          'w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'select',
      {
        value: scope.statusFilter,
        onChange: (e) => scope.setStatusFilter(e.target.value),
        className:
          'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
      },
      el('option', { value: '' }, 'Barcha holatlar'),
      el('option', { value: 'active' }, 'Faol'),
      el('option', { value: 'blocked' }, 'Bloklangan')
    ),
    el(
      'button',
      {
        type: 'submit',
        className: 'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700',
      },
      'Qidirish'
    )
  );
}
