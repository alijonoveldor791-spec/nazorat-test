// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view5 } from './view5.js';
export function view6(scope, t, amt) {
  return el(
    'div',
    {
      key: t.id,
      className:
        'rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 dark:border-slate-800 dark:bg-slate-950/60',
    },
    el(
      'div',
      { className: 'flex items-start justify-between gap-2' },
      el(
        'div',
        { className: 'min-w-0' },
        el('p', { className: 'font-medium text-sm text-slate-900 truncate dark:text-white' }, t.name),
        el(
          'p',
          { className: 'text-xs text-slate-500 dark:text-slate-400' },
          t.quarter,
          '-chorak \u00B7 Mavjud: ',
          t.count,
          ' savol'
        )
      ),
      el(
        'button',
        {
          type: 'button',
          onClick: () => scope.handleUnselectTopic(t.id),
          className: 'text-xs font-medium text-red-600 hover:underline shrink-0 dark:text-red-400',
        },
        'Olish'
      )
    ),
    el(
      'div',
      { className: 'flex items-center justify-between gap-2 text-xs' },
      el('span', { className: 'text-slate-600 dark:text-slate-300' }, 'Savollar soni:'),
      view5(scope, t, amt)
    )
  );
}
