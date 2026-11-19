// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { ShieldCheck } from '../../components/icons.js';
import { view0 } from './view0.js';
export function view1(scope) {
  return el(
    'div',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      { className: 'flex items-center gap-3 mb-5' },
      el(
        'div',
        {
          className:
            'flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/70 dark:text-blue-400',
        },
        el(ShieldCheck, { className: 'h-5 w-5' })
      ),
      el(
        'div',
        null,
        el(
          'h1',
          { className: 'font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white' },
          "O'qituvchi kabinetiga kirish"
        ),
        el(
          'p',
          { className: 'text-sm text-slate-500 dark:text-slate-400' },
          'Maktab admini yoki bosh admin login va paroli'
        )
      )
    ),
    view0(scope),
    el(
      'div',
      {
        className:
          'mt-6 border-t border-slate-200 pt-5 text-center text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400',
      },
      "O'quvchimisiz?",
      ' ',
      el(
        Link,
        { to: '/test-kirish', className: 'font-medium text-blue-600 hover:underline dark:text-blue-400' },
        "Testga kirish sahifasiga o'ting"
      )
    )
  );
}
