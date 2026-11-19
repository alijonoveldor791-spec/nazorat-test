// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ChevronLeft, ChevronRight, Send } from '../../components/icons.js';
export function view4(scope) {
  return el(
    'div',
    {
      className:
        'mt-8 flex items-center justify-between gap-3 border-t border-slate-200 pt-5 dark:border-slate-800',
    },
    el(
      'button',
      {
        type: 'button',
        disabled: scope.locked || scope.state.current === 0,
        onClick: () => scope.moveQuestion(scope.state.current - 1),
        className:
          'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200',
      },
      el(ChevronLeft, { className: 'h-4 w-4' }),
      el('span', null, 'Oldingi')
    ),
    scope.state.current === scope.state.questions.length - 1
      ? el(
          'button',
          {
            type: 'button',
            disabled: scope.locked && !scope.state.pendingSubmit,
            onClick: () =>
              scope.state.pendingSubmit ? scope.submitFinal(true) : scope.setConfirmFinish(true),
            className:
              'inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50',
          },
          el('span', null, 'Yakunlash va yuborish'),
          el(Send, { className: 'h-4 w-4' })
        )
      : el(
          'button',
          {
            type: 'button',
            disabled: scope.locked,
            onClick: () => scope.moveQuestion(scope.state.current + 1),
            className:
              'inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50',
          },
          el('span', null, 'Keyingi'),
          el(ChevronRight, { className: 'h-4 w-4' })
        )
  );
}
