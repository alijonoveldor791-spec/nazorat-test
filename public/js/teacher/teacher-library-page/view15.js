// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view15(scope) {
  return el(
    'form',
    { id: 'new-topic-form', onSubmit: scope.handleCreateTopic, className: 'space-y-4' },
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Sinf'),
      el('input', {
        type: 'text',
        required: true,
        maxLength: 60,
        value: scope.ntGrade,
        onChange: (e) => scope.setNtGrade(e.target.value),
        placeholder: '7',
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Fan'),
      el('input', {
        type: 'text',
        required: true,
        maxLength: 100,
        value: scope.ntSubject,
        onChange: (e) => scope.setNtSubject(e.target.value),
        placeholder: 'Algebra',
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Chorak'),
      el(
        'select',
        {
          value: scope.ntQuarter,
          onChange: (e) => scope.setNtQuarter(Number(e.target.value)),
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
        },
        [1, 2, 3, 4].map((q) => el('option', { key: q, value: q }, q, '-chorak'))
      )
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Mavzu nomi'),
      el('input', {
        type: 'text',
        required: true,
        maxLength: 160,
        value: scope.ntName,
        onChange: (e) => scope.setNtName(e.target.value),
        placeholder: 'Kvadrat tenglamalar',
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    )
  );
}
