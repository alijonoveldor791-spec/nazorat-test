// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { AdminShell } from '../../components/layout/admin-shell.js';
import { ConfirmDialog, Modal } from '../../components/ui/modal.js';
import { view0 } from './view0.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
import { view7 } from './view7.js';
import { view8 } from './view8.js';
import { view11 } from './view11.js';
import { view13 } from './view13.js';
import { summaryView } from './summary-view.js';
import { catalogueView } from './catalogue-view.js';
export function view14(scope) {
  return el(
    AdminShell,
    {
      session: scope.session,
      title: 'Natijalar',
      subtitle: "O'quvchilar topshirishlari, tahlil va Excel/Word eksport.",
      actions: view0(scope),
    },
    el(
      'div',
      { className: 'space-y-5' },
      summaryView(scope),
      view2(scope),
      el('div', { className: 'results-layout' }, view7(scope), view1(scope)),
      catalogueView(scope)
    ),
    el(
      Modal,
      {
        open: Boolean(scope.detailRow),
        onClose: () => scope.setDetailRow(null),
        title: 'Natija tafsiloti',
        size: 'lg',
        footer: scope.detailRow && view8(scope),
      },
      scope.detailRow && view11(scope)
    ),
    el(
      Modal,
      {
        open: Boolean(scope.analysisData),
        onClose: () => scope.setAnalysisData(null),
        title: 'Savollar tahlili',
        size: 'lg',
      },
      scope.analysisData && view13(scope)
    ),
    el(ConfirmDialog, {
      open: Boolean(scope.deleteTarget),
      onClose: () => scope.setDeleteTarget(null),
      onConfirm: scope.handleDelete,
      title: "Natija o'chirilsinmi?",
      message: "Ball va javoblar o'chiriladi.",
      confirmLabel: "O'chirish",
      danger: true,
    })
  );
}
