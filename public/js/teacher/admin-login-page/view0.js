// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ArrowRight, KeyRound } from '../../components/icons.js';
import { PasswordInput } from '../../components/ui/password-input.js';
export function view0(scope) {
  return el(
    'form',
    { onSubmit: scope.handleSubmit, className: 'space-y-4' },
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Login'),
      el(
        'div',
        { className: 'relative' },
        el('input', {
          type: 'text',
          autoComplete: 'username',
          required: true,
          value: scope.login,
          onChange: (e) => scope.setLogin(e.target.value),
          placeholder: 'Masalan: school_admin',
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        })
      )
    ),
    el(PasswordInput, {
      label: 'Parol',
      autoComplete: 'current-password',
      required: true,
      value: scope.password,
      onChange: (e) => scope.setPassword(e.target.value),
      placeholder: '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022',
    }),
    scope.error &&
      el(
        'p',
        {
          role: 'alert',
          className:
            'rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
        },
        scope.error
      ),
    el(
      'button',
      {
        type: 'submit',
        disabled: scope.busy,
        className:
          'flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-60 whitespace-nowrap',
      },
      el(KeyRound, { className: 'h-4 w-4' }),
      el('span', null, scope.busy ? 'Tekshirilmoqda...' : 'Kirish'),
      el(ArrowRight, { className: 'h-4 w-4' })
    )
  );
}
