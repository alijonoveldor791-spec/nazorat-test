// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../core/dom.js';
import { SafeContent } from '../../components/ui/safe-content.js';
import { LETTERS } from './shared.js';
export function view10(scope, idx, q, isCorrect, chosen) {
  return el(
    'div',
    { key: idx, className: 'rounded-xl border border-slate-200 p-4 text-sm dark:border-slate-800' },
    el(
      'div',
      { className: 'font-medium text-slate-900 dark:text-white' },
      idx + 1,
      '. ',
      el(SafeContent, { content: q.q, format: q.contentFormat, inline: true })
    ),
    el(
      'div',
      { className: 'mt-2 space-y-1 text-xs' },
      el(
        'p',
        {
          className: isCorrect ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-700 dark:text-red-400',
        },
        "O'quvchi javobi:",
        ' ',
        chosen === null
          ? 'Javobsiz'
          : el(
              fragment,
              null,
              LETTERS[chosen],
              '.',
              ' ',
              el(SafeContent, { content: q.options[chosen] || '', format: q.contentFormat, inline: true })
            )
      ),
      q.answer !== undefined &&
        el(
          'p',
          { className: 'text-slate-600 dark:text-slate-300' },
          "To'g'ri javob: ",
          LETTERS[q.answer],
          '.',
          ' ',
          el(SafeContent, { content: q.options[q.answer] || '', format: q.contentFormat, inline: true })
        )
    )
  );
}
