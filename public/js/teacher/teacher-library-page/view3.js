// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Check, FileUp, Plus, Sparkles } from '../../components/icons.js';
export function view3(scope, chosen, topic) {
  return el(
    'div',
    {
      className:
        'mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800',
    },
    el(
      'button',
      {
        type: 'button',
        disabled: chosen || !topic.count,
        onClick: () => scope.handleSelectTopic(topic),
        className: `inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap ${
          chosen
            ? 'bg-emerald-600 text-white'
            : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900'
        }`,
      },
      chosen ? el(Check, { className: 'h-3.5 w-3.5' }) : el(Plus, { className: 'h-3.5 w-3.5' }),
      el('span', null, chosen ? 'Tanlangan' : 'Tanlash')
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => scope.openImportModal(topic),
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(FileUp, { className: 'h-3.5 w-3.5' }),
      el('span', null, "Word qo'shish")
    ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => {
          scope.setPromptTopic(topic);
          scope.setGeneratedPrompt('');
        },
        className:
          'inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800',
      },
      el(Sparkles, { className: 'h-3.5 w-3.5' }),
      el('span', null, 'Prompt tayyorlash')
    )
  );
}
