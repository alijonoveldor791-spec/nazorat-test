// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Download, Eye } from '../../components/icons.js';
export function view3(scope, r) {
  return el(
    'td',
    { className: 'px-4 py-3 text-right no-print' },
    el(
      'div',
      { className: 'inline-flex items-center gap-1.5' },
      el(
        'button',
        {
          type: 'button',
          onClick: () => scope.openDetail(r.id),
          className:
            'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
        },
        el(Eye, { className: 'h-3.5 w-3.5' }),
        el('span', null, "Ko'rish")
      ),
      el(
        'button',
        {
          type: 'button',
          onClick: () => scope.handleDownloadWord(r.id),
          'aria-label': 'Word yuklab olish',
          title: 'Word (.docx)',
          className:
            'rounded-lg border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800',
        },
        el(Download, { className: 'h-3.5 w-3.5' })
      )
    )
  );
}
