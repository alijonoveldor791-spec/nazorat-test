// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { SafeContent } from '../../components/ui/safe-content.js';
export function view6(scope, idx, item, isCorrect) {
  return el(
    'div',
    { key: idx, className: 'space-y-2 py-4 first:pt-0 last:pb-0' },
    el(
      'div',
      { className: 'text-sm font-semibold text-slate-900 dark:text-white' },
      el('span', { className: 'mr-1.5 font-mono tabular-nums' }, idx + 1, '.'),
      el(SafeContent, { value: item.q, format: item.contentFormat })
    ),
    el(
      'p',
      {
        className: `text-sm ${
          isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400'
        }`,
      },
      'Sizning javobingiz:',
      ' ',
      item.selected === null
        ? 'Javobsiz'
        : el(SafeContent, { value: item.options[item.selected], format: item.contentFormat })
    ),
    !isCorrect &&
      el(
        'p',
        { className: 'text-sm text-emerald-700 dark:text-emerald-400' },
        "To'g'ri javob:",
        ' ',
        el(SafeContent, { value: item.options[item.answer], format: item.contentFormat })
      )
  );
}
