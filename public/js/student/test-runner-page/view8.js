// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ConfirmDialog } from '../../components/ui/modal.js';
import { view0 } from './view0.js';
import { view1 } from './view1.js';
import { view5 } from './view5.js';
import { view7 } from './view7.js';
export function view8(scope) {
  return el(
    'div',
    {
      className:
        'exam-protected min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100',
    },
    el(
      'div',
      { className: 'exam-watermark', 'aria-hidden': 'true' },
      scope.state.identity.surname,
      ' ',
      scope.state.identity.name,
      ' \u00B7 ',
      scope.state.identity.studentId || scope.state.attemptId
    ),
    scope.guardBlocked && view0(scope),
    el(
      'header',
      {
        className:
          'sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95',
      },
      el(
        'div',
        {
          className: 'mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-3 sm:px-6',
        },
        el(
          'div',
          { className: 'min-w-0' },
          el(
            'h1',
            {
              className:
                'truncate font-display text-base font-bold text-slate-900 sm:text-lg dark:text-white',
            },
            scope.state.title
          ),
          el(
            'p',
            { className: 'truncate text-xs text-slate-500 dark:text-slate-400' },
            scope.state.identity.surname,
            ' ',
            scope.state.identity.name,
            ' \u00B7 ',
            scope.state.identity.grade,
            ' \u00B7 ',
            scope.saveStatus
          )
        ),
        view1(scope)
      )
    ),
    el(
      'main',
      { className: 'mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12' },
      view5(scope),
      el(
        'aside',
        {
          className: `lg:col-span-4 ${scope.mapOpenMobile ? 'block' : 'hidden lg:block'}`,
          'aria-label': 'Savollar xaritasi',
        },
        view7(scope)
      )
    ),
    el(ConfirmDialog, {
      open: scope.confirmFinish,
      onClose: () => scope.setConfirmFinish(false),
      onConfirm: () => scope.submitFinal(false),
      title: 'Test yakunlansinmi?',
      description:
        scope.unansweredCount > 0
          ? `${scope.unansweredCount} ta savol javobsiz qolgan. Baribir yakunlab yuborilsinmi?`
          : 'Barcha javoblar tayyor. Natijani yuborasizmi?',
      confirmLabel: 'Yakunlash',
      cancelLabel: 'Testga qaytish',
      loading: scope.sending,
    })
  );
}
