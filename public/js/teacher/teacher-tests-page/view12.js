// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { LoadingState } from '../../components/ui/loading-state.js';
import { el, fragment } from '../../core/dom.js';
import { FilePlus2 } from '../../components/icons.js';
import { AdminShell } from '../../components/layout/admin-shell.js';
import { ConfirmDialog, Modal } from '../../components/ui/modal.js';
import { EmptyState } from '../../components/ui/empty-state.js';
import { view0 } from './view0.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
import { view9 } from './view9.js';
import { view11 } from './view11.js';
export function view12(scope) {
  return el(
    AdminShell,
    {
      session: scope.session,
      title: 'Testlar',
      subtitle: 'Savollarni tayyorlang, sinflarni biriktiring va vaqtni belgilang.',
      actions: el(
        'button',
        {
          type: 'button',
          onClick: () => scope.navigate('/oqituvchi/test-tahrir'),
          className:
            'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0',
        },
        el(FilePlus2, { className: 'h-4 w-4' }),
        el('span', null, 'Yangi test')
      ),
    },
    el(
      'div',
      { className: 'space-y-5' },
      view0(scope),
      el(
        'div',
        { className: 'flex flex-wrap items-center justify-between gap-3' },
        view1(scope),
        view2(scope)
      ),
      scope.loading
        ? el(LoadingState, { label: "Ma'lumotlar yuklanmoqda..." })
        : scope.visibleTests.length === 0
          ? el(EmptyState, {
              title: 'Test topilmadi',
              description: "Yangi test yarating yoki qidiruv/filtrlarni o'zgartiring.",
            })
          : view9(scope)
    ),
    el(
      Modal,
      {
        open: Boolean(scope.assignTestItem),
        onClose: () => scope.setAssignTestItem(null),
        title: 'Sinf yoki guruh biriktirish',
        footer: el(
          fragment,
          null,
          el(
            'button',
            {
              type: 'button',
              onClick: () => scope.setAssignTestItem(null),
              className:
                'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200',
            },
            'Bekor qilish'
          ),
          el(
            'button',
            {
              type: 'submit',
              form: 'assign-test-form',
              className:
                'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700',
            },
            'Biriktirish'
          )
        ),
      },
      view11(scope)
    ),
    el(ConfirmDialog, {
      open: Boolean(scope.deleteTarget),
      onClose: () => scope.setDeleteTarget(null),
      onConfirm: scope.handleDeleteOne,
      title: "Test o'chirilsinmi?",
      message: 'Eski natijalar saqlanadi. Boshlangan urinishlar yuborilmaydi.',
      confirmLabel: "O'chirish",
      danger: true,
    }),
    el(ConfirmDialog, {
      open: scope.bulkDeleteOpen,
      onClose: () => scope.setBulkDeleteOpen(false),
      onConfirm: scope.handleBulkDelete,
      title: "Tanlangan testlar o'chirilsinmi?",
      message: `${scope.selectedIds.size} ta test o'chiriladi. Eski natijalar saqlanadi.`,
      confirmLabel: "O'chirish",
      danger: true,
    }),
    el(ConfirmDialog, {
      open: Boolean(scope.codeConfirm),
      onClose: () => scope.setCodeConfirm(null),
      onConfirm: () =>
        scope.codeConfirm
          ? scope.handleCodeAction(scope.codeConfirm.test, scope.codeConfirm.action)
          : undefined,
      title: scope.codeConfirm?.action === 'revoke' ? 'Kod bekor qilinsinmi?' : 'Yangi kod yaratilsinmi?',
      message:
        scope.codeConfirm?.action === 'revoke'
          ? "Yangi urinishlar yopiladi. Boshlangan urinishlarning muddati o'zgarmaydi."
          : "Oldingi kod qayta ishlamaydi. Yangi kod barcha qatnashchilar uchun umumiy bo'ladi.",
      confirmLabel: scope.codeConfirm?.action === 'revoke' ? 'Bekor qilish' : 'Yaratish',
      danger: scope.codeConfirm?.action === 'revoke',
    })
  );
}
