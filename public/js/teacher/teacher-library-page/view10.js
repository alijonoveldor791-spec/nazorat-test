// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Download, FileText, Globe, KeyRound, Share2, Trash2 } from '../../components/icons.js';
import { ApiError, adminPost } from '../../core/api.js';
export function view10(scope, own, perms, t) {
  return el(
    'div',
    { className: 'flex flex-wrap items-center gap-2' },
    el(
      'button',
      {
        type: 'button',
        disabled: !own && !(perms.take || perms.rerunExpired),
        onClick: () => {
          scope.setPublishTestId(t.id);
          scope.setPubClassId(scope.classes[0]?.id || '');
        },
        className:
          'inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 whitespace-nowrap',
      },
      el(Globe, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Onlayn berish')
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: !own && !perms.docx,
        onClick: () => scope.handleDownloadDocument(t.id, 'docx'),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(FileText, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Word')
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: !own && !perms.pdf,
        onClick: () => scope.handleDownloadDocument(t.id, 'pdf'),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(Download, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'PDF')
    ),
    el(
      'button',
      {
        type: 'button',
        disabled: !own && !perms.key,
        onClick: () => scope.handleDownloadDocument(t.id, 'key'),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(KeyRound, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Javoblar kaliti')
    ),
    own &&
      el(
        'button',
        {
          type: 'button',
          onClick: async () => {
            try {
              await adminPost(`tests/${t.id}/share`);
              scope.toast("Ko'rib chiqishga yuborildi.");
            } catch (err) {
              scope.toast(err instanceof ApiError ? err.message : "Ulashib bo'lmadi.", true);
            }
          },
          className:
            'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
        },
        el(Share2, { className: 'h-3.5 w-3.5' }),
        el('span', null, 'Ulashish')
      ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.setDeleteTestId(t.id),
        className:
          'ml-auto inline-flex items-center gap-1 rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40',
      },
      el(Trash2, { className: 'h-3.5 w-3.5' }),
      el('span', null, "O'chirish")
    )
  );
}
