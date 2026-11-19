// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Download, Upload } from '../../components/icons.js';
export function view1(scope) {
  return el(
    'div',
    { className: 'flex flex-wrap gap-3' },
    el(
      'button',
      {
        type: 'button',
        onClick: scope.handleDownloadBackup,
        className:
          'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el(Download, { className: 'h-4 w-4' }),
      el('span', null, 'Zaxira nusxa yuklab olish')
    ),
    el(
      'label',
      {
        className:
          'inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el(Upload, { className: 'h-4 w-4' }),
      el('span', null, 'Zaxiradan tiklash (.json)'),
      el('input', {
        type: 'file',
        accept: '.json,application/json',
        onChange: scope.handleRestoreFile,
        className: 'hidden',
      })
    )
  );
}
