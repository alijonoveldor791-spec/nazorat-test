// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el, fragment } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { view3 } from './view3.js';
import { view4 } from './view4.js';
import { view5 } from './view5.js';
import { view6 } from './view6.js';
export function view7(scope) {
  return el(
    fragment,
    null,
    view3(scope),
    scope.result.sections && scope.result.sections.length > 0 && view4(scope),
    scope.result.results && scope.result.results.length > 0 && view5(scope),
    scope.result.review &&
      scope.result.review.length > 0 &&
      el(
        'section',
        {
          className:
            'space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900',
        },
        el(
          'h2',
          { className: 'font-display text-lg font-bold text-slate-900 dark:text-white' },
          'Javoblarni tahlil qiling'
        ),
        el(
          'div',
          { className: 'divide-y divide-slate-200 dark:divide-slate-800' },
          scope.result.review.map((item, idx) => {
            const isCorrect = item.selected === item.answer;
            return view6(scope, idx, item, isCorrect);
          })
        )
      ),
    el(
      'div',
      { className: 'flex justify-center pt-2' },
      el(
        Link,
        {
          to: '/',
          className: 'rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700',
        },
        'Bosh sahifaga qaytish'
      )
    )
  );
}
