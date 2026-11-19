// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Search } from '../../components/icons.js';
import { STATUS_OPTIONS, needsTest } from './result-status.js';
export function view2(scope) {
  return el(
    'div',
    {
      className:
        'flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 no-print',
    },
    el(
      'div',
      { className: 'relative min-w-[200px] flex-1' },
      el(Search, {
        className: 'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400',
      }),
      el('input', {
        type: 'search',
        value: scope.search,
        onChange: (e) => {
          scope.setSearch(e.target.value);
          scope.setPage(1);
        },
        placeholder: "Ism, familiya yoki sinf bo'yicha...",
        'aria-label': 'Natija qidirish',
        className:
          'w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    el(
      'select',
      {
        value: scope.testId,
        onChange: (e) => {
          scope.selectTest(e.target.value);
        },
        'aria-label': 'Test filtri',
        className:
          'max-w-[220px] rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el('option', { value: '' }, 'Barcha testlar'),
      scope.testOptions.map((t) => el('option', { key: t.id, value: t.id }, t.title))
    ),
    el(
      'select',
      {
        value: scope.classId,
        onChange: (e) => {
          scope.setClassId(e.target.value);
          scope.setPage(1);
        },
        'aria-label': 'Sinf filtri',
        className:
          'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el('option', { value: '' }, 'Barcha sinflar va guruhlar'),
      scope.classes.map((c) => el('option', { key: c.id, value: c.id }, c.name))
    ),
    el(
      'select',
      {
        value: scope.sort,
        onChange: (e) => {
          scope.setSort(e.target.value);
          scope.setPage(1);
        },
        'aria-label': 'Saralash',
        className:
          'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el('option', { value: 'time' }, 'Yangi topshirilgan'),
      el('option', { value: 'time-asc' }, 'Oldin topshirilgan'),
      el('option', { value: 'score' }, 'Yuqori foiz'),
      el('option', { value: 'score-asc' }, 'Past foiz'),
      el('option', { value: 'name' }, "Familiya bo'yicha")
    ),
    el(
      'label',
      { className: 'results-status-filter' },
      el('span', null, 'Topshirish holati'),
      el(
        'select',
        {
          value: scope.status,
          'aria-label': 'Topshirish holati',
          onChange: (event) => {
            scope.setStatus(event.target.value);
            scope.setPage(1);
          },
        },
        ...STATUS_OPTIONS.map(([value, label]) =>
          el('option', { key: value, value, disabled: needsTest(value) && !scope.testId }, label)
        )
      ),
      !scope.testId && el('small', null, "Boshlamaganlarni ko'rish uchun test tanlang.")
    ),
    el(
      'button',
      { type: 'button', className: 'results-secondary', onClick: scope.resetFilters },
      'Filtrlarni tozalash'
    )
  );
}
