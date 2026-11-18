// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Clock, HelpCircle, Repeat, Shuffle } from '../../components/icons.js';
export function view4(scope, test, qCount) {
  return el(
    'div',
    { className: 'flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500 dark:text-slate-400' },
    el(
      'span',
      { className: 'inline-flex items-center gap-1 tabular-nums' },
      el(Clock, { className: 'h-3.5 w-3.5' }),
      test.settings.timeLimitMin ? `${test.settings.timeLimitMin} daqiqa` : 'Vaqt cheklanmagan'
    ),
    el(
      'span',
      { className: 'inline-flex items-center gap-1 tabular-nums' },
      el(HelpCircle, { className: 'h-3.5 w-3.5' }),
      qCount,
      ' savol',
      test.settings.questionsPerAttempt ? ` / bazada ${test.bankCount ?? qCount}` : ''
    ),
    el(
      'span',
      { className: 'inline-flex items-center gap-1 tabular-nums' },
      el(Repeat, { className: 'h-3.5 w-3.5' }),
      test.settings.maxAttempts,
      ' urinish'
    ),
    test.settings.shuffleQuestions &&
      el(
        'span',
        { className: 'inline-flex items-center gap-1' },
        el(Shuffle, { className: 'h-3.5 w-3.5' }),
        'Aralashtiriladi'
      )
  );
}
