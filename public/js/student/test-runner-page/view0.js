// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Maximize2, ShieldAlert } from '../../components/icons.js';
export function view0(scope) {
  return el(
    'div',
    {
      role: 'dialog',
      'aria-modal': 'true',
      'aria-labelledby': 'exam-guard-title',
      'data-exam-guard': true,
      className:
        'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 p-4 text-white backdrop-blur-sm',
    },
    el(
      'div',
      { className: 'max-w-md space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center' },
      el(ShieldAlert, { className: 'mx-auto h-10 w-10 text-blue-400' }),
      el('h2', { id: 'exam-guard-title', className: 'font-display text-xl font-bold' }, 'Imtihon rejimi'),
      el('p', { className: 'text-sm leading-relaxed text-slate-300' }, scope.guardMsg),
      el(
        'button',
        {
          type: 'button',
          id: 'exam-guard-enter',
          onClick: scope.enterFullscreen,
          className:
            'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-500',
        },
        el(Maximize2, { className: 'h-4 w-4' }),
        el('span', null, 'Testga qaytish')
      )
    )
  );
}
