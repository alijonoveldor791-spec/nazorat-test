// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
export function view3(scope) {
  return el(
    'form',
    { onSubmit: scope.handleSaveAdmin, className: 'space-y-2.5' },
    el(
      'p',
      { className: 'text-xs font-semibold uppercase tracking-wider text-slate-500' },
      'Maktab admini yaratish / almashtirish'
    ),
    el('input', {
      type: 'text',
      required: true,
      value: scope.adminLogin,
      onChange: (e) => scope.setAdminLogin(e.target.value),
      placeholder: 'Login',
      className:
        'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950',
    }),
    el('input', {
      type: 'password',
      required: true,
      minLength: 6,
      value: scope.adminPassword,
      onChange: (e) => scope.setAdminPassword(e.target.value),
      placeholder: 'Parol',
      className:
        'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950',
    }),
    el(
      'button',
      {
        type: 'submit',
        disabled: scope.busy,
        className:
          'rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800',
      },
      'Adminni saqlash'
    )
  );
}
