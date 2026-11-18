// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../core/dom.js';
import { Modal } from '../../components/ui/modal.js';
import { QuestionEditorList } from '../../components/teacher/question-editor-list.js';
import { view21 } from './view21.js';
export function view22(scope) {
  return el(
    Modal,
    {
      open: Boolean(scope.importTopicData),
      onClose: () => scope.setImportTopicData(null),
      title: "Mavzuga savollar qo'shish",
      size: 'xl',
      footer: el(
        fragment,
        null,
        el(
          'button',
          {
            type: 'button',
            onClick: () => scope.setImportTopicData(null),
            className:
              'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700',
          },
          'Bekor qilish'
        ),
        el(
          'button',
          {
            type: 'button',
            onClick: scope.handleCommitImport,
            className: 'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700',
          },
          "Tanlanganlarni bazaga qo'shish (",
          scope.importSelected.size,
          ')'
        )
      ),
    },
    scope.importTopicData &&
      el(
        'div',
        { className: 'space-y-4' },
        el(
          'p',
          { className: 'text-xs text-slate-600 dark:text-slate-300' },
          scope.importTopicData.name,
          ' \u00B7 ',
          scope.importTopicData.quarter,
          '-chorak'
        ),
        view21(scope),
        scope.importError &&
          el('p', { className: 'text-xs text-amber-700 dark:text-amber-300' }, scope.importError),
        el(QuestionEditorList, {
          questions: scope.importQuestions,
          onChange: (next) => scope.setImportQuestions(next),
          selectionSet: scope.importSelected,
          onToggleSelect: (idx) =>
            scope.setImportSelected((prev) => {
              const next = new Set(prev);
              if (next.has(idx)) next.delete(idx);
              else next.add(idx);
              return next;
            }),
        })
      )
  );
}
