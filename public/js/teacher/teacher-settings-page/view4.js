// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { RefreshCw } from '../../components/icons.js';
import { AdminShell } from '../../components/layout/admin-shell.js';
import { ConfirmDialog } from '../../components/ui/modal.js';
import { view0 } from './view0.js';
import { view3 } from './view3.js';
export function view4(scope) {
  return el(
    AdminShell,
    {
      session: scope.session,
      title: 'Sozlamalar',
      subtitle: "Kirish paroli va maktab ma'lumotlari zaxirasini boshqaring.",
      actions: el(
        'button',
        {
          type: 'button',
          onClick: scope.loadBackupInfo,
          className:
            'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
        },
        el(RefreshCw, { className: 'h-3.5 w-3.5' }),
        el('span', null, 'Yangilash')
      ),
    },
    el('div', { className: 'grid gap-6 lg:grid-cols-2' }, view0(scope), view3(scope)),
    el(ConfirmDialog, {
      open: Boolean(scope.restorePreview),
      onClose: () => scope.setRestorePreview(null),
      onConfirm: scope.handleConfirmRestore,
      title: 'Zaxira tekshirildi',
      message: scope.restorePreview
        ? `${scope.restorePreview.counts.added} ta yozuv qo'shiladi, ${scope.restorePreview.counts.updated} ta yozuv yangilanadi. Davom etilsinmi?`
        : '',
      confirmLabel: 'Tiklash',
    }),
    el(ConfirmDialog, {
      open: scope.clearConfirmOpen,
      onClose: () => scope.setClearConfirmOpen(false),
      onConfirm: scope.handleClearLegacy,
      title: "Barcha ma'lumotlar o'chirilsinmi?",
      message:
        "Sinf, test, urinish va natijalar qaytarib bo'lmaydigan tarzda o'chiriladi. Zaxira olinganiga ishonch hosil qiling.",
      confirmLabel: "O'chirish",
      danger: true,
    })
  );
}
