// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
export function view4(scope) {
  return el(
    'form',
    { onSubmit: scope.handleSaveSubscription, className: 'space-y-2.5' },
    el('p', { className: 'text-xs font-semibold uppercase tracking-wider text-slate-500' }, 'Obuna muddati'),
    el(
      'select',
      {
        value: scope.subStatus,
        onChange: (e) => scope.setSubStatus(e.target.value),
        className:
          'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950',
      },
      el('option', { value: 'active' }, 'Faol'),
      el('option', { value: 'expired' }, 'Tugagan')
    ),
    el('input', {
      type: 'datetime-local',
      required: true,
      value: scope.endsAt,
      onChange: (e) => scope.setEndsAt(e.target.value),
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
      'Obunani saqlash'
    )
  );
}
