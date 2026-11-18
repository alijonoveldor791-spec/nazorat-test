import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { EmptyState } from '../ui/EmptyState';
import { renderMathInElement, sanitizeRichHtml } from '../../lib/content';
import type { Question } from '../../types/api';

const LETTERS = 'ABCDEF';

interface QuestionEditorListProps {
  questions: Question[];
  onChange: (next: Question[]) => void;
  allowAdd?: boolean;
  selectionSet?: Set<number>;
  onToggleSelect?: (index: number) => void;
}

interface RichFieldProps {
  html: string;
  label: string;
  onCommit: (serializedHtml: string) => void;
  onSelectImage: (img: HTMLImageElement, commitField: () => void) => void;
}

function RichEditableField({ html, label, onCommit, onSelectImage }: RichFieldProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const clean = sanitizeRichHtml(html, 'rich-html-v1');
    if (el.innerHTML !== clean) {
      el.innerHTML = clean;
      renderMathInElement(el);
    }
  }, [html]);

  const serialize = () => {
    const el = ref.current;
    if (!el) return '';
    const selected = el.querySelector('[data-editor-selected]');
    selected?.removeAttribute('data-editor-selected');
    const serialized = Array.from(el.childNodes)
      .map((node) => new XMLSerializer().serializeToString(node))
      .join('');
    if (selected) selected.setAttribute('data-editor-selected', '');
    return serialized;
  };

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      role="textbox"
      aria-label={label}
      aria-multiline="true"
      onInput={() => onCommit(serialize())}
      onClick={(e) => {
        const img = (e.target as HTMLElement).closest('img');
        if (img && ref.current?.contains(img)) {
          e.preventDefault();
          onSelectImage(img as HTMLImageElement, () => onCommit(serialize()));
        }
      }}
      className="rich-content min-h-[56px] w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white [&_[data-editor-selected]]:ring-2 [&_[data-editor-selected]]:ring-blue-500"
    />
  );
}

export function QuestionEditorList({
  questions,
  onChange,
  allowAdd = true,
  selectionSet,
  onToggleSelect,
}: QuestionEditorListProps) {
  const [removedHistory, setRemovedHistory] = useState<Record<number, { value: string; answer: number }[]>>({});
  const [selectedImg, setSelectedImg] = useState<{
    img: HTMLImageElement;
    width: string;
    height: string;
    commit: () => void;
    status: string;
    removed?: { parent: Node; next: Node | null };
  } | null>(null);

  const updateQuestion = (index: number, updater: (q: Question) => Question) => {
    onChange(questions.map((item, idx) => (idx === index ? updater(item) : item)));
  };

  const handleRemoveQuestion = (index: number) => {
    setSelectedImg(null);
    onChange(questions.filter((_, idx) => idx !== index));
  };

  const handleAddOption = (index: number) => {
    updateQuestion(index, (q) => {
      if (q.options.length >= 6) return q;
      return { ...q, options: [...q.options, ''] };
    });
  };

  const handleRemoveOption = (index: number) => {
    const q = questions[index];
    if (!q || q.options.length <= 2) return;
    const popped = q.options[q.options.length - 1];
    setRemovedHistory((prev) => {
      const stack = [...(prev[index] || []), { value: popped, answer: q.answer ?? 0 }];
      if (stack.length > 4) stack.shift();
      return { ...prev, [index]: stack };
    });
    updateQuestion(index, (item) => {
      const nextOptions = item.options.slice(0, -1);
      const nextAnswer = (item.answer ?? 0) >= nextOptions.length ? 0 : (item.answer ?? 0);
      return { ...item, options: nextOptions, answer: nextAnswer };
    });
  };

  const handleRestoreOption = (index: number) => {
    const stack = removedHistory[index] || [];
    if (!stack.length || questions[index].options.length >= 6) return;
    const saved = stack[stack.length - 1];
    setRemovedHistory((prev) => ({ ...prev, [index]: stack.slice(0, -1) }));
    updateQuestion(index, (item) => {
      const nextOptions = [...item.options, saved.value];
      const nextAnswer = saved.answer === nextOptions.length - 1 ? saved.answer : item.answer;
      return { ...item, options: nextOptions, answer: nextAnswer };
    });
  };

  const handleSelectImage = (img: HTMLImageElement, commit: () => void) => {
    selectedImg?.img?.removeAttribute('data-editor-selected');
    img.setAttribute('data-editor-selected', '');
    const w = img.getAttribute('width') || String(img.naturalWidth || Math.round(img.width) || '');
    const h = img.getAttribute('height') || String(Math.round(img.height) || img.naturalHeight || '');
    setSelectedImg({
      img,
      width: w,
      height: h,
      commit,
      status: 'Rasm tanlandi. Kenglik va balandlikni sozlang.',
    });
  };

  if (questions.length === 0) {
    return (
      <EmptyState
        title="Hali savol yo'q"
        description={
          allowAdd ? "Word fayl yuklang yoki qo'lda savol qo'shing." : "Savollar topilmadi."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {selectedImg && (
        <div
          role="group"
          aria-label="Tanlangan rasm"
          className="sticky top-16 z-20 flex flex-wrap items-end gap-3 rounded-2xl border border-blue-200 bg-blue-50/95 p-3.5 backdrop-blur dark:border-blue-900 dark:bg-blue-950/90"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-blue-800 dark:text-blue-200 mr-auto">
            <ImageIcon className="h-4 w-4" />
            <span>{selectedImg.status}</span>
          </div>
          {!selectedImg.removed && (
            <>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Kenglik (px)
                <input
                  type="number"
                  min={1}
                  max={1600}
                  value={selectedImg.width}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedImg((prev) => (prev ? { ...prev, width: val } : null));
                    if (val && Number(val) > 0 && selectedImg.img.isConnected) {
                      selectedImg.img.setAttribute('width', String(Number(val)));
                      selectedImg.commit();
                    }
                  }}
                  className="ml-1.5 w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <label className="text-xs font-medium text-slate-700 dark:text-slate-200">
                Balandlik (px)
                <input
                  type="number"
                  min={1}
                  max={1600}
                  value={selectedImg.height}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedImg((prev) => (prev ? { ...prev, height: val } : null));
                    if (val && Number(val) > 0 && selectedImg.img.isConnected) {
                      selectedImg.img.setAttribute('height', String(Number(val)));
                      selectedImg.commit();
                    }
                  }}
                  className="ml-1.5 w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900"
                />
              </label>
              <button
                type="button"
                onClick={() => {
                  if (!selectedImg.img.isConnected) return;
                  selectedImg.img.removeAttribute('width');
                  selectedImg.img.removeAttribute('height');
                  selectedImg.commit();
                  setSelectedImg((prev) =>
                    prev
                      ? {
                          ...prev,
                          width: String(prev.img.naturalWidth || Math.round(prev.img.width)),
                          height: String(prev.img.naturalHeight || Math.round(prev.img.height)),
                          status: "Asl o'lcham tiklandi.",
                        }
                      : null
                  );
                }}
                className="rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
              >
                Asl o'lcham
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!selectedImg.img.isConnected || !selectedImg.img.parentNode) return;
                  const removed = {
                    parent: selectedImg.img.parentNode,
                    next: selectedImg.img.nextSibling,
                  };
                  selectedImg.img.removeAttribute('data-editor-selected');
                  selectedImg.img.remove();
                  selectedImg.commit();
                  setSelectedImg((prev) =>
                    prev ? { ...prev, removed, status: "Rasm o'chirildi. Qaytarish mumkin." } : null
                  );
                }}
                className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700"
              >
                Rasmni o'chirish
              </button>
            </>
          )}
          {selectedImg.removed && (
            <button
              type="button"
              onClick={() => {
                const { removed, img, commit } = selectedImg;
                if (!removed?.parent.isConnected) return;
                removed.parent.insertBefore(
                  img,
                  removed.next && removed.next.parentNode === removed.parent ? removed.next : null
                );
                img.setAttribute('data-editor-selected', '');
                commit();
                setSelectedImg((prev) =>
                  prev ? { ...prev, removed: undefined, status: 'Rasm qaytarildi.' } : null
                );
              }}
              className="rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700"
            >
              Rasmni qaytarish
            </button>
          )}
          <button
            type="button"
            onClick={() => {
              selectedImg.img.removeAttribute('data-editor-selected');
              setSelectedImg(null);
            }}
            className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400"
          >
            Yopish
          </button>
        </div>
      )}

      {questions.map((q, i) => {
        const isRich = q.contentFormat === 'rich-html-v1';
        const history = removedHistory[i] || [];
        return (
          <div
            key={q.id || `q-${i}`}
            className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
              <div className="flex items-center gap-3">
                {selectionSet && onToggleSelect && (
                  <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={selectionSet.has(i)}
                      onChange={() => onToggleSelect(i)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Olish</span>
                  </label>
                )}
                <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                  {i + 1}-savol
                  {q.section ? ` · ${q.section.type} / ${q.section.subject}` : ''}
                </h3>
              </div>
              {questions.length > 1 || allowAdd ? (
                <button
                  type="button"
                  onClick={() => handleRemoveQuestion(i)}
                  className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 dark:border-red-900/60 dark:text-red-400 dark:hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>O'chirish</span>
                </button>
              ) : null}
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Savol matni</span>
              {isRich ? (
                <RichEditableField
                  html={q.q}
                  label={`${i + 1}-savol matni`}
                  onCommit={(val) => updateQuestion(i, (item) => ({ ...item, q: val }))}
                  onSelectImage={handleSelectImage}
                />
              ) : (
                <textarea
                  rows={2}
                  required
                  maxLength={2000}
                  value={q.q}
                  onChange={(e) => updateQuestion(i, (item) => ({ ...item, q: e.target.value }))}
                  placeholder="Savol matnini kiriting..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              )}
            </div>

            <div className="space-y-2.5">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                To'g'ri variant yonidagi doirani belgilang.
                {isRich ? " Rasmni bosib o'lchamini o'zgartirish yoki o'chirish mumkin." : ''}
              </p>

              {q.options.map((opt, j) => (
                <div key={j} className="flex items-start gap-2.5">
                  <input
                    type="radio"
                    name={`correct-q-${i}`}
                    checked={(q.answer ?? 0) === j}
                    onChange={() => updateQuestion(i, (item) => ({ ...item, answer: j }))}
                    aria-label={`${i + 1}-savol ${LETTERS[j]} to'g'ri javob`}
                    className="mt-3 h-4 w-4 shrink-0 border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="mt-2.5 w-5 shrink-0 text-xs font-bold text-slate-600 dark:text-slate-300">
                    {LETTERS[j]}
                  </span>
                  <div className="flex-1 min-w-0">
                    {isRich ? (
                      <RichEditableField
                        html={opt}
                        label={`${i + 1}-savol ${LETTERS[j]} varianti`}
                        onCommit={(val) =>
                          updateQuestion(i, (item) => ({
                            ...item,
                            options: item.options.map((o, idx) => (idx === j ? val : o)),
                          }))
                        }
                        onSelectImage={handleSelectImage}
                      />
                    ) : (
                      <input
                        type="text"
                        required
                        maxLength={1000}
                        value={opt}
                        onChange={(e) =>
                          updateQuestion(i, (item) => ({
                            ...item,
                            options: item.options.map((o, idx) => (idx === j ? e.target.value : o)),
                          }))
                        }
                        aria-label={`${i + 1}-savol ${LETTERS[j]} varianti`}
                        placeholder={`${LETTERS[j]} varianti...`}
                        className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                      />
                    )}
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  disabled={q.options.length >= 6}
                  onClick={() => handleAddOption(i)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Variant</span>
                </button>
                <button
                  type="button"
                  disabled={q.options.length <= 2}
                  onClick={() => handleRemoveOption(i)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <span>Oxirgi variantni olish</span>
                </button>
                {history.length > 0 && q.options.length < 6 && (
                  <button
                    type="button"
                    onClick={() => handleRestoreOption(i)}
                    className="inline-flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Variantni qaytarish</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
