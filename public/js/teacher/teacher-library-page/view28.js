// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../core/dom.js';
import { Plus, RefreshCw } from '../../components/icons.js';
import { AdminShell } from '../../components/layout/admin-shell.js';
import { ConfirmDialog, Modal } from '../../components/ui/modal.js';
import { view0 } from './view0.js';
import { view4 } from './view4.js';
import { view7 } from './view7.js';
import { view12 } from './view12.js';
import { view14 } from './view14.js';
import { view15 } from './view15.js';
import { view17 } from './view17.js';
import { view20 } from './view20.js';
import { view22 } from './view22.js';
import { view24 } from './view24.js';
import { view26 } from './view26.js';
import { view27 } from './view27.js';
export function view28(scope) {
  return el(
    AdminShell,
    {
      session: scope.session,
      title: 'Savollar bazasi',
      subtitle: 'Maktab mavzulari, chorak test qoralamalari va umumiy tayyor bank.',
      actions: el(
        'div',
        { className: 'flex flex-wrap items-center gap-2' },
        el(
          'button',
          {
            type: 'button',
            onClick: scope.loadData,
            className:
              'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
          },
          el(RefreshCw, { className: 'h-3.5 w-3.5' }),
          el('span', null, 'Yangilash')
        ),
        el(
          'button',
          {
            type: 'button',
            onClick: () => scope.setNewTopicOpen(true),
            className:
              'inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap',
          },
          el(Plus, { className: 'h-4 w-4' }),
          el('span', null, 'Yangi mavzu')
        )
      ),
    },
    el(
      'div',
      { className: 'space-y-6' },
      view0(scope),
      el(
        'div',
        { className: 'grid gap-6 lg:grid-cols-12' },
        view4(scope),
        el('aside', { className: 'lg:col-span-5' }, view7(scope))
      ),
      view12(scope),
      view14(scope)
    ),
    el(
      Modal,
      {
        open: scope.newTopicOpen,
        onClose: () => scope.setNewTopicOpen(false),
        title: 'Yangi mavzu',
        footer: el(
          fragment,
          null,
          el(
            'button',
            {
              type: 'button',
              onClick: () => scope.setNewTopicOpen(false),
              className:
                'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700',
            },
            'Bekor qilish'
          ),
          el(
            'button',
            {
              type: 'submit',
              form: 'new-topic-form',
              className:
                'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700',
            },
            'Yaratish'
          )
        ),
      },
      view15(scope)
    ),
    el(
      Modal,
      {
        open: Boolean(scope.promptTopic),
        onClose: () => scope.setPromptTopic(null),
        title: 'AI Prompt tayyorlash',
      },
      scope.promptTopic && view17(scope)
    ),
    view20(scope),
    view22(scope),
    el(
      Modal,
      {
        open: Boolean(scope.draft),
        onClose: () => scope.setDraft(null),
        title: 'Test qoralamasi',
        size: 'lg',
        footer: el(
          fragment,
          null,
          el(
            'button',
            {
              type: 'button',
              onClick: () => scope.setDraft(null),
              className:
                'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700',
            },
            'Bekor qilish'
          ),
          el(
            'button',
            {
              type: 'button',
              disabled: scope.draftBusy,
              onClick: scope.handleSaveDraft,
              className:
                'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50',
            },
            'Qoralamani saqlash'
          )
        ),
      },
      scope.draft && view24(scope)
    ),
    el(
      Modal,
      {
        open: Boolean(scope.publishTestId),
        onClose: () => scope.setPublishTestId(null),
        title: 'Onlayn berish',
        footer: el(
          fragment,
          null,
          el(
            'button',
            {
              type: 'button',
              onClick: () => scope.setPublishTestId(null),
              className:
                'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700',
            },
            'Bekor qilish'
          ),
          el(
            'button',
            {
              type: 'submit',
              form: 'publish-online-form',
              className:
                'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700',
            },
            'Faollashtirish'
          )
        ),
      },
      view26(scope)
    ),
    view27(scope),
    el(ConfirmDialog, {
      open: Boolean(scope.deleteTestId),
      onClose: () => scope.setDeleteTestId(null),
      onConfirm: scope.handleDeleteSavedTest,
      title: "Testni o'chirish",
      message: "Test o'chiriladi. Davom etasizmi?",
      confirmLabel: "O'chirish",
      danger: true,
    })
  );
}
