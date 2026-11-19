// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ShieldCheck } from '../../components/icons.js';
import { view0 } from './view0.js';
export function view1(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-6 space-y-5 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'flex items-center gap-2' },
      el(ShieldCheck, { className: 'h-5 w-5 text-blue-600 dark:text-blue-400' }),
      el('h2', { className: 'font-display text-lg font-bold' }, 'Tarif va maktab istisnolari')
    ),
    view0(scope),
    scope.policies.length > 0 &&
      el(
        'div',
        { className: 'space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800' },
        el(
          'p',
          { className: 'text-xs font-semibold uppercase tracking-wider text-slate-500' },
          'Saqlangan qoidalar'
        ),
        el(
          'div',
          { className: 'flex flex-wrap gap-2' },
          scope.policies.map((p) =>
            el(
              'button',
              {
                key: p.id,
                type: 'button',
                onClick: () => scope.loadPolicyIntoForm(p),
                className:
                  'rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200',
              },
              p.id
            )
          )
        )
      )
  );
}
