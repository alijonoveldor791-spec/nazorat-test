// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
export function view4(scope) {
  return el(
    'div',
    { className: 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' },
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Test turi'),
      el(
        'select',
        {
          value: scope.testType,
          onChange: (e) => {
            const next = e.target.value;
            scope.setTestType(next);
            if (next === 'block') scope.setScoringMode('dtm');
          },
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        },
        el('option', { value: 'ordinary' }, 'Oddiy test'),
        el('option', { value: 'block' }, 'Blok test')
      )
    ),
    scope.testType === 'block' &&
      el(
        'label',
        { className: 'block space-y-1.5' },
        el(
          'span',
          { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' },
          'Baholash rejimi'
        ),
        el(
          'select',
          {
            value: scope.scoringMode,
            onChange: (e) => scope.setScoringMode(e.target.value),
            className:
              'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
          },
          el('option', { value: 'dtm' }, 'DTM (189 ball)'),
          el('option', { value: 'normal' }, 'Oddiy (1 ball)')
        )
      ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el(
        'span',
        { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' },
        'Vaqt chegarasi (daqiqa, 0 = cheksiz)'
      ),
      el('input', {
        type: 'number',
        min: 0,
        max: 240,
        value: scope.timeLimitMin,
        onChange: (e) => scope.setTimeLimitMin(Number(e.target.value)),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el('span', { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' }, 'Urinishlar soni'),
      el('input', {
        type: 'number',
        min: 1,
        max: 100,
        value: scope.maxAttempts,
        onChange: (e) => scope.setMaxAttempts(Number(e.target.value)),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el(
        'span',
        { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' },
        'Qoidabuzarlik limiti'
      ),
      el('input', {
        type: 'number',
        min: 1,
        max: 20,
        value: scope.violationLimit,
        onChange: (e) => scope.setViolationLimit(Number(e.target.value)),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el(
        'span',
        { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' },
        'Skrinshotga urinish limiti'
      ),
      el('input', {
        type: 'number',
        min: 1,
        max: 20,
        required: true,
        value: scope.screenshotLimit,
        onChange: (event) => scope.setScreenshotLimit(Number(event.target.value)),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      }),
      el(
        'small',
        { className: 'block text-xs text-slate-500 dark:text-slate-400' },
        '1–20 ta urinish. Skrinshot umumiy limitga ham kiradi; qaysi limit oldin yetsa test yakunlanadi.'
      )
    ),
    scope.testType === 'ordinary' &&
      el(
        'label',
        { className: 'block space-y-1.5' },
        el(
          'span',
          { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' },
          'Har urinishga savollar soni (0 = barchasi)'
        ),
        el('input', {
          type: 'number',
          min: 0,
          max: 200,
          value: scope.questionsPerAttempt,
          onChange: (e) => scope.setQuestionsPerAttempt(Number(e.target.value)),
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        })
      ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el(
        'span',
        { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' },
        "Natijani ko'rsatish"
      ),
      el(
        'select',
        {
          value: scope.hideResults ? 'hide' : 'show',
          onChange: (e) => scope.setHideResults(e.target.value === 'hide'),
          className:
            'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
        },
        el('option', { value: 'show' }, "O'quvchiga ko'rsatilsin"),
        el('option', { value: 'hide' }, 'Yashirilsin')
      )
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el(
        'span',
        { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' },
        'Boshlanish vaqti (Toshkent)'
      ),
      el('input', {
        type: 'datetime-local',
        value: scope.scheduleStart,
        onChange: (e) => scope.setScheduleStart(e.target.value),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    ),
    el(
      'label',
      { className: 'block space-y-1.5' },
      el(
        'span',
        { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' },
        'Tugash vaqti (Toshkent)'
      ),
      el('input', {
        type: 'datetime-local',
        value: scope.scheduleEnd,
        onChange: (e) => scope.setScheduleEnd(e.target.value),
        className:
          'w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white',
      })
    )
  );
}
