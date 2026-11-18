// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
export function view2(scope) {
  return el(
    'form',
    { onSubmit: scope.handleSaveMeta, className: 'space-y-2.5' },
    el('p', { className: 'text-xs font-semibold uppercase tracking-wider text-slate-500' }, 'Nomi va hududi'),
    el('input', {
      type: 'text',
      required: true,
      value: scope.name,
      onChange: (e) => scope.setName(e.target.value),
      placeholder: 'Maktab nomi',
      className:
        'w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-950',
    }),
    el('input', {
      type: 'text',
      value: scope.region,
      onChange: (e) => scope.setRegion(e.target.value),
      placeholder: 'Hudud',
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
      'Saqlash'
    )
  );
}
