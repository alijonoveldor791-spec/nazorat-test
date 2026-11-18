// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ChevronDown } from '../../components/icons.js';
import { formatDateTime } from '../../core/format.js';
export function view2(scope, idx, topic) {
  return el(
    'div',
    { className: 'flex items-start justify-between gap-3' },
    el(
      'div',
      { className: 'min-w-0' },
      el(
        'div',
        { className: 'flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400' },
        el('span', { className: 'font-mono font-semibold' }, String(idx + 1).padStart(2, '0'), '.'),
        el('span', null, topic.grade, '-sinf \u00B7 ', topic.subject, ' \u00B7 ', topic.quarter, '-chorak')
      ),
      el(
        'h3',
        { className: 'mt-1 font-display text-base font-bold text-slate-900 dark:text-white' },
        topic.name
      ),
      el(
        'p',
        { className: 'mt-0.5 text-xs text-slate-500 dark:text-slate-400' },
        el('strong', { className: 'text-slate-800 dark:text-slate-200' }, topic.count, ' savol'),
        topic.lastUploadedAt ? ` · Yuklangan: ${formatDateTime(topic.lastUploadedAt)}` : ''
      )
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.openInspectTopic(topic.id),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el('span', null, 'Savollar'),
      el(ChevronDown, { className: 'h-3.5 w-3.5' })
    )
  );
}
