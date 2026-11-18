// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { SafeContent } from '../../components/ui/safe-content.js';
import { view2 } from './view2.js';
import { view3 } from './view3.js';
import { view4 } from './view4.js';
export function view5(scope) {
  return el(
    'section',
    { className: 'space-y-5 lg:col-span-8' },
    scope.errorMsg &&
      el(
        'div',
        {
          role: 'alert',
          className:
            'rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800 dark:border-red-900/60 dark:bg-red-950/50 dark:text-red-200',
        },
        scope.errorMsg
      ),
    scope.question &&
      el(
        'article',
        {
          className:
            'rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900',
        },
        view2(scope),
        el(
          'div',
          {
            className:
              'mt-6 text-base leading-relaxed font-medium text-slate-900 sm:text-lg dark:text-slate-100',
          },
          el(SafeContent, { value: scope.question.q, format: scope.question.contentFormat })
        ),
        el(
          'div',
          { className: 'mt-6 space-y-3', role: 'radiogroup', 'aria-label': 'Javob variantlari' },
          scope.question.options.map((opt, idx) => {
            const selected = scope.state.answers[scope.state.current] === idx;
            const letter = 'ABCDEF'[idx] || String(idx + 1);
            return view3(scope, idx, selected, letter, opt);
          })
        ),
        view4(scope)
      )
  );
}
