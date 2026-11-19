// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
import { el } from '../../../core/dom.js';
import { effect as useEffect, reference as useRef } from '../../../core/state.js';
import { sanitizeRichHtml } from '../../../core/content.js';
import { renderEditableMath, serializeEditableContent } from './editable-content.js';
const LETTERS = 'ABCDEF';
function RichEditableField({ html, label, onCommit, onSelectImage }) {
  const ref = useRef(null);
  const commit = useRef(onCommit);
  commit.current = onCommit;
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const clean = sanitizeRichHtml(html, 'rich-html-v1');
    if (sanitizeRichHtml(serializeEditableContent(el), 'rich-html-v1') !== clean) {
      el.innerHTML = clean;
      renderEditableMath(el);
    }
  }, [html]);
  const serialize = () => {
    const el = ref.current;
    if (!el) return '';
    return serializeEditableContent(el);
  };
  return el('div', {
    ref: ref,
    contentEditable: true,
    suppressContentEditableWarning: true,
    role: 'textbox',
    'aria-label': label,
    'aria-multiline': 'true',
    onInput: () => commit.current(serialize()),
    onClick: (e) => {
      const img = e.target.closest('img');
      if (img && ref.current?.contains(img)) {
        e.preventDefault();
        onSelectImage(img, () => commit.current(serialize()));
      }
    },
    className:
      'rich-content min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white [&_[data-editor-selected]]:ring-2 [&_[data-editor-selected]]:ring-blue-500',
  });
}
export { LETTERS, RichEditableField };
