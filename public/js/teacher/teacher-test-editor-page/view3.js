// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
export function view3(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'h2',
      { className: 'font-display text-lg font-semibold text-slate-900 dark:text-white' },
      "Asosiy ma'lumotlar va auditoriya"
    ),
    view1(scope),
    el(
      'div',
      { className: 'space-y-2' },
      el(
        'span',
        { className: 'text-sm font-medium text-slate-700 dark:text-slate-300' },
        'Biriktirilgan sinf va guruhlar'
      ),
      scope.classes.length === 0
        ? el(
            'p',
            { className: 'text-sm text-amber-700 dark:text-amber-300' },
            'Avval',
            ' ',
            el(Link, { to: '/oqituvchi/sinflar', className: 'underline font-medium' }, 'Sinflar va guruhlar'),
            ' ',
            "bo'limida sinf yarating."
          )
        : scope.visibleClasses.length === 0
          ? el(
              'p',
              { className: 'text-xs text-slate-500 dark:text-slate-400' },
              "Tanlangan auditoriya turi va yo'nalishga mos sinf/guruh topilmadi."
            )
          : view2(scope)
    )
  );
}
