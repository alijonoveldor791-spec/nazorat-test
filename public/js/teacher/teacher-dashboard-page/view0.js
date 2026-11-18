// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { CheckCircle2, ClipboardList, TrendingUp, Users } from '../../components/icons.js';
export function view0(scope) {
  return el(
    'div',
    { className: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-4' },
    el(
      'article',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900',
      },
      el(
        'div',
        { className: 'flex items-center justify-between text-slate-500 dark:text-slate-400' },
        el('span', { className: 'text-xs font-medium uppercase tracking-wider' }, 'Bugungi topshirishlar'),
        el(TrendingUp, { className: 'h-4 w-4 text-blue-600 dark:text-blue-400' })
      ),
      el(
        'p',
        { className: 'mt-3 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white' },
        scope.loading ? '—' : scope.metrics.todayCount
      ),
      el('p', { className: 'mt-1 text-xs text-slate-500 dark:text-slate-400' }, "Toshkent vaqti bo'yicha")
    ),
    el(
      'article',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900',
      },
      el(
        'div',
        { className: 'flex items-center justify-between text-slate-500 dark:text-slate-400' },
        el('span', { className: 'text-xs font-medium uppercase tracking-wider' }, 'Faol testlar'),
        el(ClipboardList, { className: 'h-4 w-4 text-emerald-600 dark:text-emerald-400' })
      ),
      el(
        'p',
        { className: 'mt-3 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white' },
        scope.loading ? '—' : scope.metrics.activeTestsCount
      ),
      el(
        'p',
        { className: 'mt-1 text-xs text-slate-500 dark:text-slate-400' },
        'Jami ',
        scope.tests.length,
        ' ta testdan'
      )
    ),
    el(
      'article',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900',
      },
      el(
        'div',
        { className: 'flex items-center justify-between text-slate-500 dark:text-slate-400' },
        el('span', { className: 'text-xs font-medium uppercase tracking-wider' }, 'Sinflar va guruhlar'),
        el(Users, { className: 'h-4 w-4 text-indigo-600 dark:text-indigo-400' })
      ),
      el(
        'p',
        { className: 'mt-3 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white' },
        scope.loading ? '—' : scope.metrics.classesCount
      ),
      el('p', { className: 'mt-1 text-xs text-slate-500 dark:text-slate-400' }, "Joriy maktab bo'yicha")
    ),
    el(
      'article',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900',
      },
      el(
        'div',
        { className: 'flex items-center justify-between text-slate-500 dark:text-slate-400' },
        el('span', { className: 'text-xs font-medium uppercase tracking-wider' }, "O'rtacha natija"),
        el(CheckCircle2, { className: 'h-4 w-4 text-amber-600 dark:text-amber-400' })
      ),
      el(
        'p',
        { className: 'mt-3 font-display text-3xl font-bold tabular-nums text-slate-900 dark:text-white' },
        scope.loading || scope.metrics.avg === null ? '—' : `${scope.metrics.avg}%`
      ),
      el(
        'p',
        { className: 'mt-1 text-xs text-slate-500 dark:text-slate-400' },
        "Barcha topshirishlar bo'yicha"
      )
    )
  );
}
