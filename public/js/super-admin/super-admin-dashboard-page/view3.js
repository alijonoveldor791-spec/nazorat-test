// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Plus } from '../../components/icons.js';
export function view3(scope) {
  return el(
    'form',
    { onSubmit: scope.handleCreateSchool, className: 'mt-4 space-y-4' },
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium' }, 'Maktab nomi'),
      el('input', {
        type: 'text',
        required: true,
        maxLength: 120,
        value: scope.newName,
        onChange: (e) => scope.setNewName(e.target.value),
        placeholder: "Masalan: 15-umumta'lim maktabi",
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium' }, 'Hudud (viloyat / tuman)'),
      el('input', {
        type: 'text',
        maxLength: 120,
        value: scope.newRegion,
        onChange: (e) => scope.setNewRegion(e.target.value),
        placeholder: 'Toshkent sh., Yunusobod',
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'button',
      {
        type: 'submit',
        disabled: scope.createBusy,
        className:
          'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60',
      },
      el(Plus, { className: 'h-4 w-4' }),
      el('span', null, scope.createBusy ? 'Yaratilmoqda...' : 'Maktabni yaratish')
    )
  );
}
