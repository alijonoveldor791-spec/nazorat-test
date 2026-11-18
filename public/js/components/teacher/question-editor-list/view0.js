// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
export function view0(scope) {
  return el(
    'button',
    {
      type: 'button',
      onClick: () => {
        if (!scope.selectedImg.img.isConnected) return;
        scope.selectedImg.img.removeAttribute('width');
        scope.selectedImg.img.removeAttribute('height');
        scope.selectedImg.commit();
        scope.setSelectedImg((prev) =>
          prev
            ? {
                ...prev,
                width: String(prev.img.naturalWidth || Math.round(prev.img.width)),
                height: String(prev.img.naturalHeight || Math.round(prev.img.height)),
                status: "Asl o'lcham tiklandi.",
              }
            : null
        );
      },
      className:
        'rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    },
    "Asl o'lcham"
  );
}
