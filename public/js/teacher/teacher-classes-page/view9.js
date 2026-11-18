// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../core/dom.js';
import { Plus } from '../../components/icons.js';
import { AdminShell } from '../../components/layout/admin-shell.js';
import { ConfirmDialog, Modal } from '../../components/ui/modal.js';
import { EmptyState } from '../../components/ui/empty-state.js';
import { view0 } from './view0.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
import { view5 } from './view5.js';
import { view6 } from './view6.js';
import { view7 } from './view7.js';
import { view8 } from './view8.js';
export function view9(scope) {
  return el(
    AdminShell,
    {
      session: scope.session,
      title: 'Sinflar va guruhlar',
      subtitle: "Sinf ro'yxatlari, shaxsiy kodlar va topshirish holatini boshqaring.",
      actions: el(
        'button',
        {
          type: 'button',
          onClick: () => scope.openEditor(),
          className:
            'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0',
        },
        el(Plus, { className: 'h-4 w-4' }),
        el('span', null, "Sinf yoki guruh qo'shish")
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
        ? el(
            'div',
            { className: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' },
            [0, 1, 2].map((i) =>
              el('div', {
                key: i,
                className:
                  'h-44 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
              })
            )
          )
        : scope.visibleClasses.length === 0
          ? el(EmptyState, {
              title: 'Sinf yoki guruh topilmadi',
              description:
                scope.classes.length === 0
                  ? "Birinchi sinf yoki guruhingizni qo'shing."
                  : "Qidiruvni yoki filtrlarni o'zgartiring.",
            })
          : view5(scope)
    ),
    el(
      Modal,
      {
        open: scope.editorOpen,
        onClose: () => scope.setEditorOpen(false),
        title: scope.editingClass ? 'Sinfni tahrirlash' : "Sinf yoki guruh qo'shish",
        footer: el(
          fragment,
          null,
          el(
            'button',
            {
              type: 'button',
              onClick: () => scope.setEditorOpen(false),
              className:
                'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
            },
            'Bekor qilish'
          ),
          el(
            'button',
            {
              type: 'submit',
              form: 'class-editor-form',
              disabled: scope.saving,
              className:
                'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60',
            },
            scope.saving ? 'Saqlanmoqda...' : 'Saqlash'
          )
        ),
      },
      view6(scope)
    ),
    el(
      Modal,
      {
        open: Boolean(scope.codesModalClass),
        onClose: () => scope.setCodesModalClass(null),
        title: scope.codesModalClass ? `${scope.codesModalClass.name} — shaxsiy kirish kodlari` : '',
      },
      scope.codesModalClass &&
        el(
          'div',
          { className: 'space-y-4' },
          el(
            'p',
            { className: 'text-xs text-slate-600 dark:text-slate-300' },
            "Har bir kodni faqat tegishli o'quvchiga bering. Umumiy guruhga yubormang."
          ),
          (scope.codesModalClass.students || []).length === 0
            ? el(EmptyState, { title: "O'quvchilar yo'q", description: "Avval sinf ro'yxatini kiriting." })
            : el(
                'div',
                { className: 'overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800' },
                view7(scope)
              )
        )
    ),
    el(
      Modal,
      {
        open: Boolean(scope.progressModalClass),
        onClose: () => scope.setProgressModalClass(null),
        title: scope.progressModalClass ? `${scope.progressModalClass.name} — topshirish holati` : '',
        size: 'lg',
      },
      scope.progressModalClass &&
        el(
          'div',
          { className: 'space-y-4' },
          scope.progressStats.length === 0
            ? el(EmptyState, {
                title: "Biriktirilgan test yo'q",
                description: 'Bu sinfga hali hech qanday test biriktirilmagan.',
              })
            : scope.progressStats.map((row) => view8(scope, row))
        )
    ),
    el(ConfirmDialog, {
      open: Boolean(scope.deleteTarget),
      onClose: () => scope.setDeleteTarget(null),
      onConfirm: scope.handleDeleteOne,
      title: "Sinf o'chirilsinmi?",
      message: scope.deleteTarget
        ? `${scope.tests.filter((t) => t.classIds.includes(scope.deleteTarget.id)).length} ta test shu sinfga biriktirilgan. Sinf testlardan olinadi, eski natijalar saqlanadi.`
        : '',
      confirmLabel: "O'chirish",
      danger: true,
    }),
    el(ConfirmDialog, {
      open: scope.bulkDeleteOpen,
      onClose: () => scope.setBulkDeleteOpen(false),
      onConfirm: scope.handleBulkDelete,
      title: "Tanlangan sinflar o'chirilsinmi?",
      message: `${scope.selectedIds.size} ta sinf yoki guruh o'chiriladi. Eski natijalar saqlanadi.`,
      confirmLabel: "O'chirish",
      danger: true,
    })
  );
}
