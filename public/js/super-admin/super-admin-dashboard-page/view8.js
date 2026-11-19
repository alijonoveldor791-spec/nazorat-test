// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { RefreshCw } from '../../components/icons.js';
import { AdminShell } from '../../components/layout/admin-shell.js';
import { ConfirmDialog } from '../../components/ui/modal.js';
import { formatDateTime } from '../../core/format.js';
import { view7 } from './view7.js';
export function view8(scope) {
  return el(
    AdminShell,
    {
      session: scope.session,
      title: 'Maktablar va platforma nazorati',
      subtitle: scope.stats?.updatedAt
        ? `Yangilangan vaqt: ${formatDateTime(scope.stats.updatedAt)}`
        : undefined,
      actions: el(
        'button',
        {
          type: 'button',
          onClick: () => scope.loadData(),
          className:
            'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
        },
        el(RefreshCw, { className: 'h-3.5 w-3.5' }),
        el('span', null, 'Yangilash')
      ),
    },
    view7(scope),
    el(ConfirmDialog, {
      open: Boolean(scope.statusTarget),
      onClose: () => scope.setStatusTarget(null),
      onConfirm: scope.handleToggleSchoolStatus,
      title: scope.statusTarget?.next === 'blocked' ? 'Maktab bloklansinmi?' : 'Maktab faollashtirilsinmi?',
      message:
        scope.statusTarget?.next === 'blocked'
          ? "Maktab admini kirishi yopiladi. Ma'lumotlar o'chirilmaydi."
          : "Maktab admini qayta kirishi mumkin bo'ladi.",
      confirmLabel: scope.statusTarget?.next === 'blocked' ? 'Bloklash' : 'Faollashtirish',
      danger: scope.statusTarget?.next === 'blocked',
    })
  );
}
