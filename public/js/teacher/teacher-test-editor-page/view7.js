// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view6 } from './view6.js';
export function view7(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'flex flex-wrap items-center justify-between gap-3' },
      el(
        'div',
        null,
        el(
          'h2',
          { className: 'font-display text-lg font-semibold text-slate-900 dark:text-white' },
          'Word (.doc / .docx) orqali import'
        ),
        el(
          'p',
          { className: 'text-xs text-slate-500 dark:text-slate-400' },
          'Formulalar, jadvallar va rasmlar serverda xavfsiz tahlil qilinadi (maks. 4 MB).'
        )
      ),
      view6(scope)
    ),
    scope.previewError &&
      el(
        'p',
        {
          role: 'alert',
          className:
            'rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
        },
        scope.previewError
      )
  );
}
