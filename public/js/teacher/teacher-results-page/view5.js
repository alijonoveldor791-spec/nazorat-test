// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view4 } from './view4.js';
export function view5(scope) {
  return el(
    'table',
    { className: 'w-full text-left text-sm' },
    el(
      'thead',
      {
        className:
          'border-b border-slate-200 bg-slate-50 text-xs font-medium uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400',
      },
      el(
        'tr',
        null,
        el('th', { className: 'px-4 py-3' }, "O'quvchi"),
        el('th', { className: 'px-4 py-3' }, 'Sinf'),
        el('th', { className: 'px-4 py-3' }, 'Test'),
        el('th', { className: 'px-4 py-3 text-right' }, 'Natija'),
        el('th', { className: 'px-4 py-3 text-right' }, 'Foiz'),
        el('th', { className: 'px-4 py-3' }, 'Vaqt'),
        el('th', { className: 'px-4 py-3 text-right no-print' }, 'Amallar')
      )
    ),
    el(
      'tbody',
      { className: 'divide-y divide-slate-100 dark:divide-slate-800' },
      scope.rows.map((r) => view4(scope, r))
    )
  );
}
