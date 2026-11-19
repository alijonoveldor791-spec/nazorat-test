// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { view3 } from './view3.js';
export function view4(scope) {
  return el(
    'div',
    { className: 'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:flex' },
    el(
      'aside',
      { className: 'hidden w-64 shrink-0 border-r border-slate-200 lg:block dark:border-slate-800' },
      el('div', { className: 'sticky top-0 h-screen overflow-y-auto' }, scope.sidebarContent)
    ),
    scope.mobileOpen &&
      el(
        'div',
        { className: 'fixed inset-0 z-50 flex lg:hidden' },
        el('div', { className: 'fixed inset-0 bg-slate-950/60', onClick: () => scope.setMobileOpen(false) }),
        el(
          'aside',
          {
            className:
              'relative z-10 w-72 max-w-[85vw] border-r border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
          },
          scope.sidebarContent
        )
      ),
    el(
      'div',
      { className: 'flex min-w-0 flex-1 flex-col' },
      el(
        'header',
        {
          className:
            'sticky top-0 z-30 border-b border-slate-200 bg-white/90 px-4 py-3.5 backdrop-blur-md sm:px-8 dark:border-slate-800 dark:bg-slate-900/90 no-print',
        },
        view3(scope)
      ),
      el('main', { className: 'mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8' }, scope.children)
    )
  );
}
