// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { el } from '../../../core/dom.js';
import { state as useState, effect } from '../../../core/state.js';
import { sectionedEditor } from '../sectioned-editor.js';
import { EmptyState } from '../../ui/empty-state.js';
import { view2 } from './view2.js';
import { view7 } from './view7.js';
import { imageControls } from './image-controls.js';
export function part0(scope) {
  [scope.editorSection, scope.setEditorSection] = useState(() => scope.questions[0]?.section?.id || null);
  effect(() => {
    scope.setEditorSection(scope.questions[0]?.section?.id || null);
  }, [scope.questions[0]?.section?.id]);
  [scope.removedHistory, scope.setRemovedHistory] = useState({});
  [scope.selectedImg, scope.setSelectedImg] = useState(null);
  imageControls(scope);
  scope.updateQuestion = (index, updater) => {
    scope.onChange(scope.questions.map((item, idx) => (idx === index ? updater(item) : item)));
  };
  scope.handleRemoveQuestion = (index) => {
    scope.setSelectedImg(null);
    scope.onChange(scope.questions.filter((_, idx) => idx !== index));
  };
  scope.handleAddOption = (index) => {
    scope.updateQuestion(index, (q) => {
      if (q.options.length >= 6) return q;
      return { ...q, options: [...q.options, ''] };
    });
  };
  scope.handleRemoveOption = (index) => {
    const q = scope.questions[index];
    if (!q || q.options.length <= 2) return;
    const popped = q.options[q.options.length - 1];
    scope.setRemovedHistory((prev) => {
      const stack = [...(prev[index] || []), { value: popped, answer: q.answer ?? 0 }];
      if (stack.length > 4) stack.shift();
      return { ...prev, [index]: stack };
    });
    scope.updateQuestion(index, (item) => {
      const nextOptions = item.options.slice(0, -1);
      const nextAnswer = (item.answer ?? 0) >= nextOptions.length ? 0 : (item.answer ?? 0);
      return { ...item, options: nextOptions, answer: nextAnswer };
    });
  };
  scope.handleRestoreOption = (index) => {
    const stack = scope.removedHistory[index] || [];
    if (!stack.length || scope.questions[index].options.length >= 6) return;
    const saved = stack[stack.length - 1];
    scope.setRemovedHistory((prev) => ({ ...prev, [index]: stack.slice(0, -1) }));
    scope.updateQuestion(index, (item) => {
      const nextOptions = [...item.options, saved.value];
      const nextAnswer = saved.answer === nextOptions.length - 1 ? saved.answer : item.answer;
      return { ...item, options: nextOptions, answer: nextAnswer };
    });
  };
  scope.handleSelectImage = (img, commit) => {
    if (scope.selectedImg?.img === img) return;
    scope.selectedImg?.img?.removeAttribute('data-editor-selected');
    img.setAttribute('data-editor-selected', '');
    const w = img.getAttribute('width') || String(img.naturalWidth || Math.round(img.width) || '');
    const h = img.getAttribute('height') || String(Math.round(img.height) || img.naturalHeight || '');
    scope.setSelectedImg({
      img,
      width: w,
      height: h,
      commit,
      history: [],
      future: [],
      status: 'Rasm tanlandi. Kenglik va balandlikni sozlang.',
    });
  };
  if (scope.questions.length === 0) {
    return {
      done: true,
      value: el(EmptyState, {
        title: "Hali savol yo'q",
        description: scope.allowAdd ? "Word fayl yuklang yoki qo'lda savol qo'shing." : 'Savollar topilmadi.',
      }),
    };
  }
  return {
    done: true,
    value: el(
      'div',
      { className: 'space-y-4' },
      scope.selectedImg && view2(scope),
      sectionedEditor(scope, (q, i) => {
        const isRich = q.contentFormat === 'rich-html-v1';
        const history = scope.removedHistory[i] || [];
        return view7(scope, q, i, isRich, history);
      })
    ),
  };
}
