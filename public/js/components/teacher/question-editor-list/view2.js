// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
import { Image as ImageIcon } from '../../icons.js';
import { view1 } from './view1.js';
export function view2(scope) {
  return el(
    'div',
    {
      role: 'group',
      'aria-label': 'Tanlangan rasm',
      className:
        'sticky top-16 z-20 flex flex-wrap items-end gap-3 rounded-2xl border border-blue-200 bg-blue-50/95 p-3.5 backdrop-blur dark:border-blue-900 dark:bg-blue-950/90',
    },
    el(
      'div',
      { className: 'flex items-center gap-2 text-xs font-semibold text-blue-800 dark:text-blue-200 mr-auto' },
      el(ImageIcon, { className: 'h-4 w-4' }),
      el('span', null, scope.selectedImg.status)
    ),
    !scope.selectedImg.removed && view1(scope),
    scope.selectedImg.removed &&
      el(
        'button',
        {
          type: 'button',
          onClick: () => {
            const { removed, img, commit } = scope.selectedImg;
            if (!removed?.parent.isConnected) return;
            removed.parent.insertBefore(
              img,
              removed.next && removed.next.parentNode === removed.parent ? removed.next : null
            );
            img.setAttribute('data-editor-selected', '');
            commit();
            scope.setSelectedImg((prev) =>
              prev ? { ...prev, removed: undefined, status: 'Rasm qaytarildi.' } : null
            );
          },
          className: 'rounded-lg bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700',
        },
        'Rasmni qaytarish'
      ),
    el(
      'button',
      {
        type: 'button',
        onClick: () => {
          scope.selectedImg.img.removeAttribute('data-editor-selected');
          scope.setSelectedImg(null);
        },
        className: 'text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400',
      },
      'Yopish'
    )
  );
}
