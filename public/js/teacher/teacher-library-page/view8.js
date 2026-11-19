// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view8(scope) {
  return el(
    'div',
    { className: 'flex flex-wrap items-center gap-2.5' },
    el('input', {
      type: 'search',
      value: scope.testQuery,
      onChange: (e) => {
        scope.setTestQuery(e.target.value);
        scope.setTestPage(1);
      },
      placeholder: 'Test nomi yoki kodi...',
      className:
        'rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
    }),
    el(
      'div',
      {
        className:
          'inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950',
      },
      ['Barchasi', 'Qoralama', 'Faol'].map((label, idx) =>
        el(
          'button',
          {
            key: label,
            type: 'button',
            onClick: () => {
              scope.setTestStatusTab(idx);
              scope.setTestPage(1);
            },
            className: `rounded-lg px-2.5 py-1 text-xs font-medium ${
              scope.testStatusTab === idx
                ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                : 'text-slate-600 dark:text-slate-400'
            }`,
          },
          label
        )
      )
    )
  );
}
