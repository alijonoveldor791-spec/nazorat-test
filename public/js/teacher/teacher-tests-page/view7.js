// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { formatDateTime } from '../../core/format.js';
import { view3 } from './view3.js';
import { view4 } from './view4.js';
import { view6 } from './view6.js';
export function view7(scope, test, statusColor, regularNames, groupNames, qCount) {
  return el(
    'div',
    { className: 'space-y-3' },
    el('div', { className: 'flex items-start justify-between gap-3' }, view3(scope, test, statusColor)),
    el(
      'div',
      { className: 'text-xs text-slate-600 space-y-1 dark:text-slate-400' },
      regularNames &&
        el(
          'p',
          null,
          'Fan: ',
          el(
            'span',
            { className: 'font-medium text-slate-800 dark:text-slate-200' },
            test.subject || 'Belgilanmagan'
          ),
          ' \u00B7 Sinf:',
          ' ',
          el('span', { className: 'font-medium text-slate-800 dark:text-slate-200' }, regularNames)
        ),
      groupNames &&
        el(
          'p',
          null,
          "Yo'nalish: ",
          el('span', { className: 'font-medium text-slate-800 dark:text-slate-200' }, test.direction || '—'),
          ' \u00B7 Guruh:',
          ' ',
          el('span', { className: 'font-medium text-slate-800 dark:text-slate-200' }, groupNames)
        )
    ),
    view4(scope, test, qCount),
    (test.schedule?.start || test.schedule?.end) &&
      el(
        'div',
        { className: 'text-xs text-slate-500 dark:text-slate-400' },
        'Boshlanish: ',
        formatDateTime(test.schedule?.start),
        ' \u00B7 Tugash: ',
        formatDateTime(test.schedule?.end)
      ),
    test.testCode
      ? view6(scope, test)
      : el('p', { className: 'text-xs text-slate-400' }, "Kod uchun maktab bog'lanishi kerak.")
  );
}
