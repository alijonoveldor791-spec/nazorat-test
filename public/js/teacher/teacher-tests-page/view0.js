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
        placeholder: "Test nomi bo'yicha qidirish...",
        'aria-label': 'Test qidirish',
        className:
          'w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    el(
      'div',
      {
        className:
          'inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950',
      },
      [
        ['all', 'Barchasi'],
        ['class', 'Sinflar'],
        ['group', 'Guruhlar'],
      ].map(([val, label]) =>
        el(
          'button',
          {
            key: val,
            type: 'button',
            onClick: () => {
              scope.setAudience(val);
              scope.setSelectedIds(new Set());
            },
            className: `rounded-lg px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap ${
              scope.audience === val
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`,
          },
          label
        )
      )
    ),
    el(
      'select',
      {
        value: scope.statusFilter,
        onChange: (e) => {
          scope.setStatusFilter(e.target.value);
          scope.setSelectedIds(new Set());
        },
        'aria-label': 'Holat filtri',
        className:
          'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el('option', { value: '' }, 'Barcha holatlar'),
      el('option', { value: 'active' }, 'Faol'),
      el('option', { value: 'paused' }, "To'xtatilgan"),
      el('option', { value: 'scheduled' }, 'Jadvalda'),
      el('option', { value: 'ended' }, 'Yakunlangan')
    ),
    el(
      'select',
      {
        value: scope.sortOrder,
        onChange: (e) => scope.setSortOrder(e.target.value),
        'aria-label': 'Saralash',
        className:
          'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el('option', { value: 'newest' }, "Yangi qo'shilgan"),
      el('option', { value: 'oldest' }, "Eski qo'shilgan")
    )
  );
}
