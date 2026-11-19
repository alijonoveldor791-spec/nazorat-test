// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ShieldAlert } from '../../components/icons.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
export function view3(scope) {
  return el(
    'section',
    {
      className:
        'rounded-2xl border border-slate-200 bg-white p-6 space-y-5 dark:border-slate-800 dark:bg-slate-900',
    },
    el(
      'div',
      null,
      el(
        'h2',
        { className: 'font-display text-lg font-bold text-slate-900 dark:text-white' },
        'Zaxira va tiklash'
      ),
      el(
        'p',
        { className: 'mt-1 text-xs text-slate-500 dark:text-slate-400' },
        'Testlar, sinflar va natijalar bitta JSON faylda. Parol va token kaliti zaxiraga kiritilmaydi.'
      )
    ),
    view1(scope),
    el(
      'p',
      { className: 'text-xs text-slate-500 dark:text-slate-400' },
      "Server faylni tekshiradi va qo'shish/yangilash sonini ko'rsatadi. Maktab admini faqat o'z maktabi zaxirasini tiklaydi."
    ),
    scope.statusText() &&
      el(
        'p',
        {
          className:
            'rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300',
        },
        scope.statusText()
      ),
    scope.warnings.map((msg, i) =>
      el('p', { key: i, role: 'alert', className: 'text-xs text-red-600 dark:text-red-400' }, msg)
    ),
    !scope.loading && scope.archives.length > 0 && view2(scope),
    scope.session?.role === 'school_admin' &&
      el(
        'p',
        { className: 'text-xs text-slate-500 dark:text-slate-400' },
        'Faol urinishlar tugamaguncha tiklash boshlanmaydi.'
      ),
    scope.session?.role === 'legacy_admin' &&
      el(
        'div',
        { className: 'border-t border-slate-200 pt-4 space-y-2 dark:border-slate-800' },
        el(
          'div',
          { className: 'flex items-center gap-2 text-red-700 dark:text-red-400' },
          el(ShieldAlert, { className: 'h-4 w-4' }),
          el('h3', { className: 'text-sm font-semibold' }, "Ma'lumotlarni tozalash")
        ),
        el(
          'p',
          { className: 'text-xs text-slate-500 dark:text-slate-400' },
          "Bu amal maktabga biriktirilmagan eski sinflar, testlar, urinishlar va natijalarni o'chiradi. Avval zaxira oling."
        ),
        el(
          'button',
          {
            type: 'button',
            onClick: () => scope.setClearConfirmOpen(true),
            className: 'rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700',
          },
          "Eski ma'lumotlarni tozalash"
        )
      )
  );
}
