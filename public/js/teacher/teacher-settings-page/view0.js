// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { KeyRound } from '../../components/icons.js';
import { PasswordInput } from '../../components/ui/password-input.js';
export function view0(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'flex items-center gap-2.5' },
      el(KeyRound, { className: 'h-5 w-5 text-blue-600 dark:text-blue-400' }),
      el(
        'h2',
        { className: 'font-display text-lg font-bold text-slate-900 dark:text-white' },
        "Parolni o'zgartirish"
      )
    ),
    el(
      'p',
      { className: 'text-xs text-slate-500 dark:text-slate-400' },
      'Yangi parol ',
      scope.minLen,
      '\u2013',
      scope.maxLen,
      " belgigacha bo'lsin. Saqlangach barcha eski sessiyalar tugaydi."
    ),
    el(
      'form',
      { onSubmit: scope.handlePasswordChange, className: 'space-y-4' },
      el(PasswordInput, {
        label: 'Joriy parol',
        autoComplete: 'current-password',
        required: true,
        value: scope.currentPassword,
        onChange: (e) => scope.setCurrentPassword(e.target.value),
      }),
      el(PasswordInput, {
        label: 'Yangi parol',
        autoComplete: 'new-password',
        required: true,
        minLength: scope.minLen,
        maxLength: scope.maxLen,
        value: scope.newPassword,
        onChange: (e) => scope.setNewPassword(e.target.value),
      }),
      el(
        'button',
        {
          type: 'submit',
          disabled: scope.passwordBusy,
          className:
            'rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60',
        },
        scope.passwordBusy ? 'Saqlanmoqda...' : 'Yangi parolni saqlash'
      )
    )
  );
}
