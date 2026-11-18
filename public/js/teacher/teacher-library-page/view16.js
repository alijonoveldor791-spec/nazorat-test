// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view16(scope) {
  return el(
    'form',
    { onSubmit: scope.handleGeneratePrompt, className: 'grid gap-3 sm:grid-cols-2' },
    el(
      'label',
      { className: 'block space-y-1' },
      el('span', { className: 'text-xs font-medium text-slate-700 dark:text-slate-300' }, 'Savollar soni'),
      el('input', {
        type: 'number',
        min: 1,
        max: 200,
        value: scope.promptCount,
        onChange: (e) => scope.setPromptCount(Number(e.target.value)),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1' },
      el('span', { className: 'text-xs font-medium text-slate-700 dark:text-slate-300' }, 'Qiyinlik'),
      el(
        'select',
        {
          value: scope.promptLevel,
          onChange: (e) => scope.setPromptLevel(e.target.value),
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950',
        },
        el('option', { value: 'Oson' }, 'Oson'),
        el('option', { value: "O'rtacha" }, "O'rtacha"),
        el('option', { value: 'Qiyin' }, 'Qiyin')
      )
    ),
    el(
      'button',
      {
        type: 'submit',
        className:
          'sm:col-span-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700',
      },
      'Promptni yaratish'
    )
  );
}
