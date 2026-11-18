// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ACTIONS } from './shared.js';
export function view0(scope) {
  return el(
    'form',
    { onSubmit: scope.handleSavePolicy, className: 'space-y-4' },
    el(
      'label',
      { className: 'block space-y-1' },
      el('span', { className: 'text-xs font-medium' }, 'Tur'),
      el(
        'select',
        {
          value: scope.policyType,
          onChange: (e) => scope.setPolicyType(e.target.value),
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
        },
        el('option', { value: 'tariff' }, 'Tarif'),
        el('option', { value: 'school' }, 'Maktab')
      )
    ),
    el(
      'label',
      { className: 'block space-y-1' },
      el('span', { className: 'text-xs font-medium' }, 'Target ID'),
      el('input', {
        type: 'text',
        required: true,
        value: scope.policyTarget,
        onChange: (e) => scope.setPolicyTarget(e.target.value),
        placeholder: 'Tarif yoki maktab ichki IDsi',
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1' },
      el('span', { className: 'text-xs font-medium' }, 'Tarif ID'),
      el('input', {
        type: 'text',
        value: scope.policyTariff,
        onChange: (e) => scope.setPolicyTariff(e.target.value),
        placeholder: 'Masalan: pro',
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'div',
      { className: 'space-y-2.5 border-t border-slate-100 pt-3 dark:border-slate-800' },
      Object.entries(ACTIONS).map(([key, label]) =>
        el(
          'label',
          { key: key, className: 'flex items-center justify-between gap-2 text-xs' },
          el('span', { className: 'text-slate-700 dark:text-slate-300' }, label),
          el(
            'select',
            {
              value: scope.policyRules[key] || '',
              onChange: (e) =>
                scope.setPolicyRules((prev) => ({
                  ...prev,
                  [key]: e.target.value,
                })),
              className:
                'rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950',
            },
            el('option', { value: '' }, 'Tarifdan'),
            el('option', { value: 'true' }, 'Ruxsat'),
            el('option', { value: 'false' }, 'Yopiq')
          )
        )
      )
    ),
    el(
      'button',
      {
        type: 'submit',
        disabled: scope.policyBusy,
        className:
          'w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60',
      },
      scope.policyBusy ? 'Saqlanmoqda...' : 'Qoidani saqlash'
    )
  );
}
