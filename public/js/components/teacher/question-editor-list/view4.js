// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { LETTERS, RichEditableField } from './shared.js';
export function view4(scope, isRich, opt, i, j) {
  return el(
    'div',
    { className: 'flex-1 min-w-0' },
    isRich
      ? el(RichEditableField, {
          html: opt,
          label: `${i + 1}-savol ${LETTERS[j]} varianti`,
          onCommit: (val) =>
            scope.updateQuestion(i, (item) => ({
              ...item,
              options: item.options.map((o, idx) => (idx === j ? val : o)),
            })),
          onSelectImage: scope.handleSelectImage,
        })
      : el('input', {
          type: 'text',
          required: true,
          maxLength: 1000,
          value: opt,
          onChange: (e) =>
            scope.updateQuestion(i, (item) => ({
              ...item,
              options: item.options.map((o, idx) => (idx === j ? e.target.value : o)),
            })),
          'aria-label': `${i + 1}-savol ${LETTERS[j]} varianti`,
          placeholder: `${LETTERS[j]} varianti...`,
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        })
  );
}
