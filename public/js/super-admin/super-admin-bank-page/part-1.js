// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { el } from '../../core/dom.js';
import { RefreshCw } from '../../components/icons.js';
import { AdminShell } from '../../components/layout/admin-shell.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
import { view4 } from './view4.js';
export function part1(scope) {
  return {
    done: true,
    value: el(
      AdminShell,
      {
        session: scope.session,
        title: 'Umumiy test banki',
        subtitle: 'Tarif va maktab istisnolarini hamda tayyor testlar moderatsiyasini boshqaring.',
        actions: el(
          'button',
          {
            type: 'button',
            onClick: scope.loadData,
            className:
              'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
          },
          el(RefreshCw, { className: 'h-3.5 w-3.5' }),
          el('span', null, 'Yangilash')
        ),
      },
      el('div', { className: 'grid gap-6 lg:grid-cols-12' }, view1(scope), view2(scope)),
      view4(scope)
    ),
  };
}
