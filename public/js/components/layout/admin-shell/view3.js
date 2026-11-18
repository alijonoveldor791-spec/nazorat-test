// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { Menu } from '../../icons.js';
export function view3(scope) {
  return el(
    'div',
    { className: 'mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4' },
    el(
      'div',
      { className: 'flex items-center gap-3 min-w-0' },
      el(
        'button',
        {
          type: 'button',
          onClick: () => scope.setMobileOpen(true),
          className:
            'rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 lg:hidden dark:border-slate-700 dark:text-slate-300',
          'aria-label': 'Menyuni ochish',
        },
        el(Menu, { className: 'h-5 w-5' })
      ),
      el(
        'div',
        { className: 'min-w-0' },
        el(
          'h1',
          {
            className: 'text-xl font-bold tracking-tight text-slate-900 truncate sm:text-2xl dark:text-white',
          },
          scope.title
        ),
        scope.subtitle &&
          el(
            'p',
            { className: 'text-xs text-slate-500 truncate sm:text-sm dark:text-slate-400' },
            scope.subtitle
          )
      )
    ),
    scope.actions &&
      el(
        'div',
        { className: 'admin-page-actions flex flex-wrap items-center gap-2.5 shrink-0' },
        scope.actions
      )
  );
}
