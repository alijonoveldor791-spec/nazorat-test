// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ApiError, adminPost } from '../../core/api.js';
export function view13(scope, st) {
  return el(
    'div',
    { className: 'flex flex-wrap gap-2' },
    el(
      'button',
      {
        type: 'button',
        disabled: !scope.bankAccess.permissions?.take,
        onClick: async () => {
          try {
            await adminPost(`shared-tests/${st.id}/take`);
            scope.toast("Test maktab ro'yxatiga olindi.");
            await scope.loadData();
          } catch (err) {
            scope.toast(err instanceof ApiError ? err.message : "Olib bo'lmadi.", true);
          }
        },
        className:
          'rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40',
      },
      'Testni olish'
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: !scope.bankAccess.permissions?.docx,
        onClick: () => scope.handleDownloadDocument(st.id, 'docx', true),
        className:
          'rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200',
      },
      'Word'
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: !scope.bankAccess.permissions?.pdf,
        onClick: () => scope.handleDownloadDocument(st.id, 'pdf', true),
        className:
          'rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200',
      },
      'PDF'
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: !scope.bankAccess.permissions?.key,
        onClick: () => scope.handleDownloadDocument(st.id, 'key', true),
        className:
          'rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200',
      },
      'Javoblar kaliti'
    )
  );
}
