// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { Link } from '../../../core/navigation.js';
import { LogOut, Moon, Sun } from '../../icons.js';
import { view1 } from './view1.js';
export function view2(scope) {
  return el(
    'div',
    { className: 'space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800' },
    scope.session && view1(scope),
    el(
      'div',
      { className: 'flex items-center gap-2' },
      el(
        Link,
        {
          to: '/',
          className:
            'flex-1 rounded-lg border border-slate-200 px-3 py-2 text-center text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
        },
        "O'quvchi sahifasi"
      ),
      el(
        'button',
        {
          type: 'button',
          onClick: scope.toggleTheme,
          'aria-label': scope.theme === 'dark' ? "Kunduzgi rejimga o'tish" : "Qorong'i rejimga o'tish",
          className:
            'rounded-lg border border-slate-200 p-2 text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
        },
        scope.theme === 'dark' ? el(Sun, { className: 'h-4 w-4' }) : el(Moon, { className: 'h-4 w-4' })
      )
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: scope.handleLogout,
        className:
          'flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-red-50 hover:border-red-200 hover:text-red-700 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-red-950/50 dark:hover:border-red-900 dark:hover:text-red-300',
      },
      el(LogOut, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Chiqish')
    )
  );
}
