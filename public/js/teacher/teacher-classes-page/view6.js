// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view6(scope) {
  return el(
    'form',
    { id: 'class-editor-form', onSubmit: scope.handleSaveClass, className: 'space-y-4' },
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Tur'),
      el(
        'select',
        {
          value: scope.formKind,
          onChange: (e) => scope.setFormKind(e.target.value),
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        },
        el('option', { value: 'class' }, 'Sinf'),
        el('option', { value: 'group' }, 'Guruh')
      )
    ),
    scope.formKind === 'group' &&
      el(
        'label',
        { className: 'block space-y-1.5' },
        el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, "Yo'nalish nomi"),
        el('input', {
          type: 'text',
          required: true,
          maxLength: 100,
          value: scope.formDirection,
          onChange: (e) => scope.setFormDirection(e.target.value),
          placeholder: 'Masalan: Matematika - Fizika',
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        })
      ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Nom'),
      el('input', {
        type: 'text',
        required: true,
        maxLength: 60,
        value: scope.formName,
        onChange: (e) => scope.setFormName(e.target.value),
        placeholder: scope.formKind === 'group' ? '1-guruh' : '7-A',
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el(
        'span',
        { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' },
        "O'quvchilar ro'yxati (ixtiyoriy)"
      ),
      el('textarea', {
        rows: 6,
        value: scope.formRoster,
        onChange: (e) => scope.setFormRoster(e.target.value),
        placeholder: 'Aliyev Ali\nValiyeva Malika',
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      }),
      el(
        'span',
        { className: 'block text-xs text-slate-500 dark:text-slate-400' },
        "Har qatorda bitta Familiya Ism. Ro'yxatdan qatorni olib tashlash o'quvchini o'chiradi."
      )
    )
  );
}
