// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../core/dom.js';
import { Check, Copy } from '../../components/icons.js';
export function view5(scope, test) {
  return el(
    'div',
    { className: 'flex flex-wrap items-center gap-1.5' },
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.handleCopyCode(test),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
      },
      scope.copiedId === test.id
        ? el(
            fragment,
            null,
            el(Check, { className: 'h-3.5 w-3.5 text-emerald-600' }),
            el('span', null, 'Nusxalandi')
          )
        : el(fragment, null, el(Copy, { className: 'h-3.5 w-3.5' }), el('span', null, 'Nusxalash'))
    ),
    test.testCode.state === 'inactive' &&
      el(
        'button',
        {
          type: 'button',
          onClick: () => scope.handleCodeAction(test, 'activate'),
          className:
            'rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 whitespace-nowrap',
        },
        'Faollashtirish'
      ),
    test.testCode.state !== 'revoked'
      ? el(
          'button',
          {
            type: 'button',
            onClick: () => scope.setCodeConfirm({ test, action: 'revoke' }),
            className:
              'rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 whitespace-nowrap dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40',
          },
          'Bekor qilish'
        )
      : el(
          'button',
          {
            type: 'button',
            onClick: () => scope.setCodeConfirm({ test, action: 'replace' }),
            className:
              'rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
          },
          'Yangi kod'
        )
  );
}
