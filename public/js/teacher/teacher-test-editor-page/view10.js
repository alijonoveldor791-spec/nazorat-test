// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view10(scope) {
  return el(
    'div',
    { className: 'space-y-2.5 text-sm text-slate-700 dark:text-slate-200' },
    el(
      'p',
      null,
      el('strong', null, 'Test turi:'),
      ' ',
      scope.testType === 'block' ? 'Blok test' : 'Oddiy test'
    ),
    el('p', null, el('strong', null, scope.title), ' \u00B7 ', scope.questions.length, ' savol'),
    scope.shuffleQuestions &&
      el(
        'p',
        { className: 'text-xs text-slate-500 dark:text-slate-400' },
        scope.testType === 'block'
          ? "Savollar har bir fan bo'limining o'z ichida aralashtiriladi."
          : 'Savollar aralashtiriladi.'
      ),
    scope.testType === 'ordinary' &&
      scope.questionsPerAttempt > 0 &&
      el(
        'p',
        { className: 'text-xs text-slate-500 dark:text-slate-400' },
        'Har urinishga bazadan ',
        scope.questionsPerAttempt,
        ' ta savol tanlanadi.'
      ),
    scope.sectionsSummary.map((sec) =>
      el(
        'p',
        { key: sec.id, className: 'text-xs text-slate-600 dark:text-slate-300' },
        sec.type,
        ' \u00B7 ',
        sec.subject,
        ': ',
        sec.count,
        ' savol'
      )
    ),
    el(
      'p',
      null,
      el('strong', null, 'Auditoriya:'),
      ' ',
      scope.activeSelectedIds.map((id) => scope.classes.find((c) => c.id === id)?.name || id).join(', ')
    ),
    el(
      'p',
      null,
      el('strong', null, 'Vaqt:'),
      ' ',
      scope.timeLimitMin || 'Cheksiz',
      ' daqiqa \u00B7 ',
      el('strong', null, 'Urinish:'),
      ' ',
      scope.maxAttempts
    )
  );
}
