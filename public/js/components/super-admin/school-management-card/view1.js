// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../../core/dom.js';
import { Check, Copy, ShieldBan, ShieldCheck } from '../../icons.js';
export function view1(scope) {
  return el(
    'div',
    { className: 'flex flex-wrap items-center gap-2' },
    el(
      'button',
      {
        type: 'button',
        onClick: scope.onCopyId,
        className:
          'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 font-mono text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200',
      },
      el('span', null, scope.school.public_school_id || scope.school.id),
      scope.copied
        ? el(Check, { className: 'h-3.5 w-3.5 text-emerald-600' })
        : el(Copy, { className: 'h-3.5 w-3.5' })
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: scope.onToggleStatus,
        className: `inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold ${
          scope.school.status === 'blocked'
            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
            : 'border border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400'
        }`,
      },
      scope.school.status === 'blocked'
        ? el(
            fragment,
            null,
            el(ShieldCheck, { className: 'h-3.5 w-3.5' }),
            el('span', null, 'Faollashtirish')
          )
        : el(fragment, null, el(ShieldBan, { className: 'h-3.5 w-3.5' }), el('span', null, 'Bloklash'))
    )
  );
}
