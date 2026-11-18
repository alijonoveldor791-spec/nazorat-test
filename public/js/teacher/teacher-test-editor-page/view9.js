// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { Save } from '../../components/icons.js';
import { QuestionEditorList } from '../../components/teacher/question-editor-list.js';
import { view3 } from './view3.js';
import { view4 } from './view4.js';
import { view5 } from './view5.js';
import { view7 } from './view7.js';
import { view8 } from './view8.js';
export function view9(scope) {
  return el(
    'form',
    { onSubmit: scope.handleOpenConfirm, className: 'space-y-6' },
    view3(scope),
    el(
      'section',
      {
        className:
          'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 dark:border-slate-800 dark:bg-slate-900',
      },
      el(
        'h2',
        { className: 'font-display text-lg font-semibold text-slate-900 dark:text-white' },
        'Test sozlamalari va jadval'
      ),
      view4(scope),
      scope.testType === 'block' &&
        el(
          'p',
          { className: 'text-xs text-slate-500 dark:text-slate-400' },
          scope.scoringMode === 'dtm'
            ? '1-mutaxassislik: 3,1; 2-mutaxassislik: 2,1; majburiy fanlar: 1,1 ball. Jami 189 ball.'
            : "Oddiy baholash: har bir to'g'ri javob 1 ball. 3,1 / 2,1 / 1,1 uchun DTM rejimini tanlang."
        ),
      view5(scope)
    ),
    view7(scope),
    el(
      'section',
      { className: 'space-y-4' },
      view8(scope),
      el(QuestionEditorList, { questions: scope.questions, onChange: scope.setQuestions })
    ),
    el(
      'div',
      {
        className:
          'sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95',
      },
      el(
        Link,
        {
          to: '/oqituvchi/testlar',
          className:
            'rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200',
        },
        'Bekor qilish'
      ),
      el(
        'button',
        {
          type: 'submit',
          className:
            'inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700',
        },
        el(Save, { className: 'h-4 w-4' }),
        el('span', null, 'Testni saqlash')
      )
    )
  );
}
