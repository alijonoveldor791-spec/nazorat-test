// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { Moon, Sun } from '../../components/icons.js';
export function view6(scope) {
  return el(
    'div',
    { className: 'mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 sm:px-6' },
    el(
      'div',
      { className: 'flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400' },
      el('span', { className: 'font-display font-bold text-slate-900 dark:text-white' }, 'Nazorat'),
      el('span', null, '\u00B7'),
      el('span', null, "O'rganing, sinab ko'ring, yuksaling.")
    ),
    el(
      'div',
      { className: 'flex items-center gap-4' },
      el(
        Link,
        {
          to: '/oqituvchi/kirish',
          className:
            'text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white',
        },
        'Maktab sahifasi'
      ),
      el(
        'button',
        {
          type: 'button',
          onClick: scope.toggleTheme,
          className:
            'inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
        },
        scope.theme === 'dark'
          ? el(Sun, { className: 'h-3.5 w-3.5' })
          : el(Moon, { className: 'h-3.5 w-3.5' }),
        el('span', null, scope.theme === 'dark' ? 'Kunduzgi rejim' : "Qorong'i rejim")
      )
    )
  );
}
