// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { FileUp } from '../../components/icons.js';
export function view6(scope) {
  return el(
    'div',
    { className: 'flex flex-wrap items-center gap-2.5' },
    el('input', {
      type: 'file',
      accept: '.doc,.docx',
      onChange: scope.handleFileChange,
      className:
        'text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200',
    }),
    el(
      'button',
      {
        type: 'button',
        onClick: scope.handlePreview,
        disabled: scope.previewBusy,
        className:
          'inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100',
      },
      el(FileUp, { className: 'h-3.5 w-3.5' }),
      el('span', null, scope.previewBusy ? 'Tahlil qilinmoqda...' : 'Faylni tahlil qilish')
    )
  );
}
