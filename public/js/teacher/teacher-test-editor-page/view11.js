// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { LoadingState } from '../../components/ui/loading-state.js';
import { el, fragment } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { ArrowLeft } from '../../components/icons.js';
import { AdminShell } from '../../components/layout/admin-shell.js';
import { ConfirmDialog, Modal } from '../../components/ui/modal.js';
import { view9 } from './view9.js';
import { view10 } from './view10.js';
export function view11(scope) {
  return el(
    AdminShell,
    {
      session: scope.session,
      title: scope.testId ? 'Testni tahrirlash' : 'Yangi test yaratish',
      subtitle: scope.testId
        ? 'Test nomi, sinflari va savollarini yangilang.'
        : 'Test nomi, sinflari va savollarini kiriting.',
      actions: el(
        Link,
        {
          to: '/oqituvchi/testlar',
          className:
            'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
        },
        el(ArrowLeft, { className: 'h-4 w-4' }),
        el('span', null, 'Testlarga qaytish')
      ),
    },
    scope.loading ? el(LoadingState, { label: "Ma'lumotlar yuklanmoqda..." }) : view9(scope),
    el(ConfirmDialog, {
      open: Boolean(scope.replacePreviewConfirm),
      onClose: () => scope.setReplacePreviewConfirm(null),
      onConfirm: () => {
        if (scope.replacePreviewConfirm) scope.applyPreviewQuestions(scope.replacePreviewConfirm);
        scope.setReplacePreviewConfirm(null);
      },
      title: 'Mavjud savollar almashtirilsinmi?',
      message: "Previewdagi savollar hozir tahrirlangan savollar o'rniga qo'yiladi.",
      confirmLabel: 'Almashtirish',
    }),
    el(
      Modal,
      {
        open: scope.confirmSaveOpen,
        onClose: () => scope.setConfirmSaveOpen(false),
        title: 'Testni saqlashni tasdiqlang',
        footer: el(
          fragment,
          null,
          el(
            'button',
            {
              type: 'button',
              onClick: () => scope.setConfirmSaveOpen(false),
              className:
                'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200',
            },
            'Bekor qilish'
          ),
          el(
            'button',
            {
              type: 'button',
              onClick: scope.handleSave,
              disabled: scope.saving,
              className:
                'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60',
            },
            scope.saving ? 'Saqlanmoqda...' : 'Tasdiqlash va saqlash'
          )
        ),
      },
      view10(scope)
    )
  );
}
