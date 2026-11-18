// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { view0 } from './view0.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
import { view3 } from './view3.js';
import { view4 } from './view4.js';
import { view5 } from './view5.js';
export function view6(scope) {
  return el(
    'div',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'border-b border-slate-200 pb-6 dark:border-slate-800' },
      el(
        'h1',
        { className: 'font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white' },
        'Testga kirish'
      ),
      el(
        'p',
        { className: 'mt-1 text-sm text-slate-500 dark:text-slate-400' },
        'Taymer faqat oxirgi bosqichda \u00ABTestni boshlash\u00BB tugmasini bosganingizdan keyin ishlaydi.'
      ),
      view0(scope)
    ),
    el(
      'form',
      { onSubmit: scope.handleNext, className: 'mt-6 space-y-5' },
      scope.step === 1 && view1(scope),
      scope.step === 2 && scope.resolved && view2(scope),
      scope.step === 3 && view3(scope),
      scope.step === 4 &&
        scope.resolved &&
        el(
          'div',
          {
            className:
              'space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950',
          },
          el(
            'h2',
            { className: 'text-sm font-semibold text-slate-900 dark:text-white' },
            "Ma'lumotlarni tekshiring"
          ),
          view4(scope)
        ),
      scope.error &&
        el(
          'p',
          {
            role: 'alert',
            className:
              'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
          },
          scope.error
        ),
      view5(scope)
    )
  );
}
