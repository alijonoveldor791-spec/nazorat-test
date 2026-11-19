// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { ArrowLeft, ArrowRight } from '../../components/icons.js';
export function view5(scope) {
  return el(
    'div',
    { className: 'flex items-center justify-between gap-3 pt-2' },
    scope.step > 1
      ? el(
          'button',
          {
            type: 'button',
            disabled: scope.busy,
            onClick: () => {
              scope.setStep((s) => s - 1);
              scope.setError('');
            },
            className:
              'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
          },
          el(ArrowLeft, { className: 'h-4 w-4' }),
          el('span', null, 'Orqaga')
        )
      : el(
          Link,
          {
            to: '/eski-testlar',
            className:
              'text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200',
          },
          'Kodsiz ochiq testlar'
        ),
    el(
      'button',
      {
        type: 'submit',
        disabled: scope.busy || (scope.step === 1 && !scope.resolved),
        className:
          'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50',
      },
      el('span', null, scope.busy ? 'Bajarilmoqda...' : scope.step === 4 ? 'Testni boshlash' : 'Davom etish'),
      el(ArrowRight, { className: 'h-4 w-4' })
    )
  );
}
