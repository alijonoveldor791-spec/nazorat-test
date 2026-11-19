// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { RichEditableField } from './shared.js';
import { view3 } from './view3.js';
import { view6 } from './view6.js';
export function view7(scope, q, i, isRich, history) {
  return el(
    'div',
    {
      key: q.id || `q-${i}`,
      className:
        'rounded-2xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900',
    },
    view3(scope, i, q),
    el(
      'div',
      { className: 'space-y-1.5' },
      el('span', { className: 'text-xs font-medium text-slate-600 dark:text-slate-400' }, 'Savol matni'),
      isRich
        ? el(RichEditableField, {
            html: q.q,
            label: `${i + 1}-savol matni`,
            onCommit: (val) => scope.updateQuestion(i, (item) => ({ ...item, q: val })),
            onSelectImage: scope.handleSelectImage,
          })
        : el('textarea', {
            rows: 2,
            required: true,
            maxLength: 2000,
            value: q.q,
            onChange: (e) => scope.updateQuestion(i, (item) => ({ ...item, q: e.target.value })),
            placeholder: 'Savol matnini kiriting...',
            className:
              'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white',
          })
    ),
    view6(scope, isRich, q, i, history)
  );
}
