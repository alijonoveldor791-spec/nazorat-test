// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Modal } from '../../components/ui/modal.js';
import { QuestionEditorList } from '../../components/teacher/question-editor-list.js';
import { view19 } from './view19.js';
export function view20(scope) {
  return el(
    Modal,
    {
      open: Boolean(scope.inspectTopicData),
      onClose: () => {
        scope.setInspectTopicData(null);
        scope.setEditingQuestion(null);
      },
      title: scope.inspectTopicData ? scope.inspectTopicData.name : '',
      size: 'lg',
    },
    scope.inspectTopicData && !scope.editingQuestion && view19(scope),
    scope.editingQuestion &&
      el(
        'div',
        { className: 'space-y-4' },
        el(QuestionEditorList, {
          questions: [scope.editingQuestion],
          allowAdd: false,
          onChange: (next) => scope.setEditingQuestion(next[0] || null),
        }),
        el(
          'div',
          { className: 'flex justify-end gap-2' },
          el(
            'button',
            {
              type: 'button',
              onClick: () => scope.setEditingQuestion(null),
              className:
                'rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700',
            },
            'Orqaga'
          ),
          el(
            'button',
            {
              type: 'button',
              onClick: scope.handleSaveEditedTopicQuestion,
              className:
                'rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700',
            },
            'Saqlash'
          )
        )
      )
  );
}
