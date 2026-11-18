// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Copy } from '../../components/icons.js';
import { copyToClipboard } from '../../core/format.js';
import { view16 } from './view16.js';
export function view17(scope) {
  return el(
    'div',
    { className: 'space-y-4' },
    view16(scope),
    scope.generatedPrompt &&
      el(
        'div',
        { className: 'space-y-2' },
        el('textarea', {
          rows: 8,
          readOnly: true,
          value: scope.generatedPrompt,
          className:
            'w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200',
        }),
        el(
          'button',
          {
            type: 'button',
            onClick: async () => {
              const ok = await copyToClipboard(scope.generatedPrompt);
              scope.toast(ok ? 'Prompt nusxalandi.' : 'Nusxalanmadi.', !ok);
            },
            className:
              'inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200',
          },
          el(Copy, { className: 'h-3.5 w-3.5' }),
          el('span', null, 'Nusxalash')
        )
      )
  );
}
