// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view21(scope) {
  return el(
    'div',
    {
      className:
        'flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60',
    },
    el('input', {
      type: 'file',
      accept: '.doc,.docx',
      onChange: (e) => scope.setImportFile(e.target.files?.[0] || null),
      className: 'text-xs',
    }),
    el(
      'button',
      {
        type: 'button',
        disabled: scope.importBusy,
        onClick: scope.handlePreviewImportWord,
        className:
          'rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900',
      },
      scope.importBusy ? 'Tahlil...' : 'Word faylni tahlil qilish'
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => {
          const idx = scope.importQuestions.length;
          scope.setImportQuestions((prev) => [...prev, { q: '', options: ['', ''], answer: 0 }]);
          scope.setImportSelected((prev) => new Set(prev).add(idx));
        },
        className:
          'ml-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-900',
      },
      '+ Savol'
    )
  );
}
