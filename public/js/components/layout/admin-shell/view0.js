// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { Link, NavLink } from '../../../core/navigation.js';
import { X } from '../../icons.js';
export function view0(scope) {
  return el(
    'div',
    null,
    el(
      'div',
      { className: 'flex items-center justify-between px-2 pb-6' },
      el(
        Link,
        {
          to: scope.isSuper ? '/bosh-admin' : '/oqituvchi',
          className: 'font-display text-xl font-bold tracking-tight text-slate-900 dark:text-white',
        },
        'Nazorat'
      ),
      el(
        'button',
        {
          type: 'button',
          onClick: () => scope.setMobileOpen(false),
          className:
            'rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-slate-800',
          'aria-label': 'Menyuni yopish',
        },
        el(X, { className: 'h-5 w-5' })
      )
    ),
    el(
      'nav',
      { 'aria-label': "Kabinet bo'limlari", className: 'space-y-1' },
      scope.navItems.map((item) => {
        const Icon = item.icon;
        return el(
          NavLink,
          {
            key: item.to,
            to: item.to,
            end: item.end,
            onClick: () => scope.setMobileOpen(false),
            className: ({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
              }`,
          },
          el(Icon, { className: 'h-4 w-4 shrink-0' }),
          el('span', { className: 'truncate' }, item.label)
        );
      })
    )
  );
}
