// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { RefreshCw } from '../../components/icons.js';
export function view0(scope) {
  return el(
    'div',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'h1',
      { className: 'font-display text-2xl font-bold text-slate-900 dark:text-white' },
      'Natija yashirilgan'
    ),
    el(
      'p',
      { className: 'mt-2 text-sm text-slate-600 dark:text-slate-300' },
      scope.refreshFailed
        ? "Natijani tekshirib bo'lmadi. Aloqani tekshiring va sahifani yangilang."
        : "O'qituvchi natijalarni ochganidan so'ng ball va tahlil ko'rinadi."
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: scope.refreshing,
        onClick: () => scope.refresh(scope.saved),
        className:
          'mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50',
      },
      el(RefreshCw, { className: `h-4 w-4 ${scope.refreshing ? 'animate-spin' : ''}` }),
      el('span', null, 'Holatni yangilash')
    )
  );
}
