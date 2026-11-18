// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view4(scope) {
  return el(
    'dl',
    { className: 'grid gap-3 text-sm sm:grid-cols-2' },
    el(
      'div',
      null,
      el('dt', { className: 'text-xs text-slate-500 dark:text-slate-400' }, 'Maktab'),
      el(
        'dd',
        { className: 'font-medium text-slate-900 dark:text-white' },
        scope.resolved.school.name,
        ' (',
        scope.resolved.school.public_school_id,
        ')'
      )
    ),
    el(
      'div',
      null,
      el('dt', { className: 'text-xs text-slate-500 dark:text-slate-400' }, 'Test'),
      el('dd', { className: 'font-medium text-slate-900 dark:text-white' }, scope.resolved.test.title)
    ),
    el(
      'div',
      null,
      el('dt', { className: 'text-xs text-slate-500 dark:text-slate-400' }, 'Sinf / Guruh'),
      el('dd', { className: 'font-medium text-slate-900 dark:text-white' }, scope.chosenClass?.name)
    ),
    el(
      'div',
      null,
      el('dt', { className: 'text-xs text-slate-500 dark:text-slate-400' }, "O'quvchi"),
      el(
        'dd',
        { className: 'font-medium text-slate-900 dark:text-white' },
        scope.surname.trim(),
        ' ',
        scope.name.trim()
      )
    ),
    el(
      'div',
      null,
      el('dt', { className: 'text-xs text-slate-500 dark:text-slate-400' }, 'Savollar soni'),
      el(
        'dd',
        { className: 'font-mono font-medium tabular-nums text-slate-900 dark:text-white' },
        scope.resolved.test.count,
        ' ta'
      )
    ),
    el(
      'div',
      null,
      el('dt', { className: 'text-xs text-slate-500 dark:text-slate-400' }, 'Ajratilgan vaqt'),
      el(
        'dd',
        { className: 'font-mono font-medium tabular-nums text-slate-900 dark:text-white' },
        scope.resolved.test.settings.timeLimitMin
          ? `${scope.resolved.test.settings.timeLimitMin} daqiqa`
          : 'Cheklanmagan'
      )
    )
  );
}
