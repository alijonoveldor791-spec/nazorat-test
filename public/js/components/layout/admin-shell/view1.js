// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { Copy } from '../../icons.js';
export function view1(scope) {
  return el(
    'div',
    { className: 'px-2 text-xs text-slate-500 dark:text-slate-400' },
    el(
      'p',
      { className: 'font-medium text-slate-800 dark:text-slate-200 truncate' },
      scope.isSuper ? 'Bosh admin' : scope.session.schoolName || 'Maktab kabineti'
    ),
    el(
      'p',
      { className: 'mt-0.5 truncate' },
      scope.session.login || (scope.session.role === 'legacy_admin' ? 'Umumiy admin' : 'Admin')
    ),
    scope.session.public_school_id &&
      el(
        'button',
        {
          type: 'button',
          onClick: scope.handleCopySchoolId,
          className:
            'mt-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 font-mono text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
        },
        el('span', null, scope.session.public_school_id),
        el(Copy, { className: 'h-3 w-3' })
      )
  );
}
