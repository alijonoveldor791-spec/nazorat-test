// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Search } from '../../components/icons.js';
export function view1(scope) {
  return el(
    'div',
    {
      className:
        'grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900',
    },
    el('input', {
      type: 'text',
      value: scope.gradeFilter,
      onChange: (e) => scope.setGradeFilter(e.target.value),
      placeholder: 'Sinf (mas: 7)',
      'aria-label': 'Sinf filtri',
      className:
        'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
    }),
    el('input', {
      type: 'text',
      value: scope.subjectFilter,
      onChange: (e) => scope.setSubjectFilter(e.target.value),
      placeholder: 'Fan...',
      'aria-label': 'Fan filtri',
      className:
        'rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
    }),
    el(
      'select',
      {
        value: scope.quarterFilter,
        onChange: (e) => scope.setQuarterFilter(e.target.value),
        'aria-label': 'Chorak filtri',
        className:
          'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el('option', { value: '' }, 'Barcha choraklar'),
      [1, 2, 3, 4].map((q) => el('option', { key: q, value: q }, q, '-chorak'))
    ),
    el(
      'div',
      { className: 'relative' },
      el(Search, {
        className: 'pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400',
      }),
      el('input', {
        type: 'search',
        value: scope.topicQuery,
        onChange: (e) => scope.setTopicQuery(e.target.value),
        placeholder: 'Mavzu...',
        'aria-label': 'Mavzu qidirish',
        className:
          'w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    )
  );
}
