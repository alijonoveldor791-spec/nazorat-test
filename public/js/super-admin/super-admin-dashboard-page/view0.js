// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view0(scope) {
  return el(
    'div',
    { className: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-5' },
    el(
      'div',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
      },
      el('p', { className: 'text-xs font-medium text-slate-500 dark:text-slate-400' }, 'Jami maktablar'),
      el(
        'p',
        { className: 'mt-1 font-display text-2xl font-bold tabular-nums' },
        scope.stats?.totalSchools ?? '—'
      )
    ),
    el(
      'div',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
      },
      el('p', { className: 'text-xs font-medium text-slate-500 dark:text-slate-400' }, 'Faol maktablar'),
      el(
        'p',
        { className: 'mt-1 font-display text-2xl font-bold tabular-nums' },
        scope.stats?.activeSchools ?? '—'
      )
    ),
    el(
      'div',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
      },
      el('p', { className: 'text-xs font-medium text-slate-500 dark:text-slate-400' }, 'Faol obunalar'),
      el(
        'p',
        { className: 'mt-1 font-display text-2xl font-bold tabular-nums' },
        scope.stats?.activeSubscriptions ?? '—'
      )
    ),
    el(
      'div',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
      },
      el('p', { className: 'text-xs font-medium text-slate-500 dark:text-slate-400' }, 'Jami testlar'),
      el(
        'p',
        { className: 'mt-1 font-display text-2xl font-bold tabular-nums' },
        scope.stats?.totalTests ?? '—'
      )
    ),
    el(
      'div',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900',
      },
      el('p', { className: 'text-xs font-medium text-slate-500 dark:text-slate-400' }, 'Urinishlar'),
      el(
        'p',
        { className: 'mt-1 font-display text-2xl font-bold tabular-nums' },
        scope.stats?.totalAttempts ?? '—'
      )
    )
  );
}
