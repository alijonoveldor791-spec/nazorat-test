// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../core/dom.js';
import { Download, RotateCcw, Trash2 } from '../../components/icons.js';
export function view8(scope) {
  return el(
    fragment,
    null,
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.handleDownloadWord(scope.detailRow.id),
        className:
          'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
      },
      el(Download, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Word (.docx)')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.handleAllowRetake(scope.detailRow.id),
        className:
          'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
      },
      el(RotateCcw, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Qayta topshirishga ruxsat')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.setDeleteTarget(scope.detailRow.id),
        className:
          'inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-red-700',
      },
      el(Trash2, { className: 'h-3.5 w-3.5' }),
      el('span', null, "O'chirish")
    )
  );
}
