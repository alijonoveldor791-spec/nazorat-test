// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../../core/dom.js';
export function view0(scope) {
  return el(
    'button',
    {
      type: 'button',
      onClick: scope.resetImageSize,
      className:
        'rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200',
    },
    "Asl o'lcham"
  );
}
