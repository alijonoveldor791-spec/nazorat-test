// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
import { ArrowRight } from '../../components/icons.js';
export function view0(scope) {
  return el(
    'div',
    { className: 'flex flex-col justify-center lg:col-span-6' },
    el(
      'p',
      { className: 'text-xs font-semibold tracking-wider text-blue-700 dark:text-blue-400' },
      'Maktablar va abituriyentlar uchun raqamli baholash tizimi'
    ),
    el(
      'h1',
      {
        id: 'hero-title',
        className:
          'mt-3 font-display text-4xl leading-[1.12] font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white',
        style: { textWrap: 'balance' },
      },
      'Bilimingizni ishonch va aniqlik bilan sinang'
    ),
    el(
      'p',
      { className: 'mt-5 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg dark:text-slate-300' },
      "Maktab IDsi va 6 raqamli test kodi bilan ro'yxatdan o'tmasdan testga kiring. Taymer faqat savollarni boshlaganingizda ishga tushadi, javoblaringiz esa oflayn holatda ham saqlanadi."
    ),
    el(
      'div',
      { className: 'mt-8 flex flex-wrap items-center gap-4' },
      el(
        Link,
        {
          to: '/test-kirish',
          className:
            'inline-flex items-center gap-2.5 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600',
        },
        el('span', null, "Testga o'tish"),
        el(ArrowRight, { className: 'h-4 w-4' })
      ),
      el(
        Link,
        {
          to: '/oqituvchi/kirish',
          className:
            'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
        },
        "O'qituvchi kabineti"
      )
    ),
    el(
      'p',
      { className: 'mt-4 text-xs text-slate-500 dark:text-slate-400' },
      "O'quvchi uchun login va parol talab qilinmaydi \u00B7 Natija serverda hisoblanadi"
    )
  );
}
