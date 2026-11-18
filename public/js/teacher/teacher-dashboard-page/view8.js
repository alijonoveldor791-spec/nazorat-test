// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { FilePlus2, Plus } from '../../components/icons.js';
import { AdminShell } from '../../components/layout/admin-shell.js';
import { ConfirmDialog, Modal } from '../../components/ui/modal.js';
import { view0 } from './view0.js';
import { view2 } from './view2.js';
import { view3 } from './view3.js';
import { view4 } from './view4.js';
import { view7 } from './view7.js';
export function view8(scope) {
  return el(
    AdminShell,
    {
      session: scope.session,
      title: 'Bosh sahifa',
      subtitle: "Maktabingizdagi testlar va o'quvchilar natijalari.",
      actions: el(
        fragment,
        null,
        el(
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
        el(
          Link,
          {
            to: '/oqituvchi/sinflar',
            className:
              'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
          },
          el(Plus, { className: 'h-4 w-4' }),
          el('span', null, 'Sinf yoki guruh')
        )
      ),
    },
    el(
      'div',
      { className: 'space-y-6' },
      view0(scope),
      el('div', { className: 'grid gap-6 lg:grid-cols-12' }, view2(scope), view3(scope))
    ),
    el(
      Modal,
      {
        open: Boolean(scope.detailRow),
        onClose: () => scope.setDetailRow(null),
        title: 'Natija tafsiloti',
        size: 'lg',
        footer: scope.detailRow && view4(scope),
      },
      scope.detailRow && view7(scope)
    ),
    el(ConfirmDialog, {
      open: Boolean(scope.deleteTarget),
      onClose: () => scope.setDeleteTarget(null),
      onConfirm: scope.handleConfirmDelete,
      title: "Natija o'chirilsinmi?",
      message: "Ball va javoblar o'chiriladi.",
      confirmLabel: "O'chirish",
      danger: true,
    })
  );
}
