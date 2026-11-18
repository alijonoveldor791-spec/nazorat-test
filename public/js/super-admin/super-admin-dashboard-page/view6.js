// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { KeyRound } from '../../components/icons.js';
import { PasswordInput } from '../../components/ui/password-input.js';
export function view6(scope) {
  return el(
    'section',
    {
      className:
        'max-w-md rounded-2xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'flex items-center gap-2' },
      el(KeyRound, { className: 'h-5 w-5 text-blue-600 dark:text-blue-400' }),
      el('h2', { className: 'font-display text-lg font-bold' }, 'Bosh admin paroli')
    ),
    el(
      'form',
      { onSubmit: scope.handleRootPassword, className: 'space-y-4' },
      el(PasswordInput, {
        label: 'Joriy parol',
        required: true,
        value: scope.rootCurrent,
        onChange: (e) => scope.setRootCurrent(e.target.value),
      }),
      el(PasswordInput, {
        label: 'Yangi parol',
        required: true,
        minLength: 6,
        maxLength: 128,
        value: scope.rootNext,
        onChange: (e) => scope.setRootNext(e.target.value),
      }),
      el(
        'button',
        {
          type: 'submit',
          disabled: scope.rootBusy,
          className:
            'rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60',
        },
        scope.rootBusy ? 'Saqlanmoqda...' : 'Parolni saqlash'
      )
    )
  );
}
