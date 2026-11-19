// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../../core/dom.js';
import { view0 } from './view0.js';
export function view1(scope) {
  return el(
    fragment,
    null,
    el(
      'label',
      { className: 'text-xs font-medium text-slate-700 dark:text-slate-200' },
      'Kenglik (px)',
      el('input', {
        type: 'number',
        min: 1,
        max: 1600,
        value: scope.selectedImg.width,
        onChange: (e) => scope.resizeImage('width', e.target.value),
        onFocus: scope.endImageResize,
        onBlur: scope.endImageResize,
        className:
          'ml-1.5 w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900',
      })
    ),
    el(
      'label',
      { className: 'text-xs font-medium text-slate-700 dark:text-slate-200' },
      'Balandlik (px)',
      el('input', {
        type: 'number',
        min: 1,
        max: 1600,
        value: scope.selectedImg.height,
        onChange: (e) => scope.resizeImage('height', e.target.value),
        onFocus: scope.endImageResize,
        onBlur: scope.endImageResize,
        className:
          'ml-1.5 w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900',
      })
    ),
    view0(scope),
    el(
      'button',
      {
        type: 'button',
        onClick: () => {
          if (!scope.selectedImg.img.isConnected || !scope.selectedImg.img.parentNode) return;
          const removed = {
            parent: scope.selectedImg.img.parentNode,
            next: scope.selectedImg.img.nextSibling,
          };
          scope.selectedImg.img.removeAttribute('data-editor-selected');
          scope.selectedImg.img.remove();
          scope.selectedImg.commit();
          scope.setSelectedImg((prev) =>
            prev ? { ...prev, removed, status: "Rasm o'chirildi. Qaytarish mumkin." } : null
          );
        },
        className: 'rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700',
      },
      "Rasmni o'chirish"
    )
  );
}
