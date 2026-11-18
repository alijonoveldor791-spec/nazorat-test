// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { BookOpenCheck, CheckCircle2, Clock, ShieldCheck } from '../../components/icons.js';
export function view4(scope) {
  return el(
    'div',
    { className: 'grid gap-4 sm:grid-cols-2 lg:col-span-7' },
    el(
      'article',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900',
      },
      el(Clock, { className: 'h-5 w-5 text-blue-600 dark:text-blue-400' }),
      el(
        'h3',
        { className: 'mt-3 font-display text-base font-semibold text-slate-900 dark:text-white' },
        'Aniq server taymeri'
      ),
      el(
        'p',
        { className: 'mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300' },
        "Taymer faqat \u00ABTestni boshlash\u00BB tugmasidan so'ng ishlaydi va vaqt server bilan sinxron yuritiladi."
      )
    ),
    el(
      'article',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900',
      },
      el(ShieldCheck, { className: 'h-5 w-5 text-blue-600 dark:text-blue-400' }),
      el(
        'h3',
        { className: 'mt-3 font-display text-base font-semibold text-slate-900 dark:text-white' },
        'Halol imtihon muhiti'
      ),
      el(
        'p',
        { className: 'mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300' },
        "To'liq ekran nazorati, oyna almashishini qayd etish va avtomatik qoralama saqlash bilan ishonchli tekshiruv."
      )
    ),
    el(
      'article',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900',
      },
      el(BookOpenCheck, { className: 'h-5 w-5 text-blue-600 dark:text-blue-400' }),
      el(
        'h3',
        { className: 'mt-3 font-display text-base font-semibold text-slate-900 dark:text-white' },
        "O'qituvchilar uchun qulay baza"
      ),
      el(
        'p',
        { className: 'mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300' },
        'Word (.docx) hujjatlardan formulali savollarni bir zumda import qiling va tayyor chorak testlarini tuzing.'
      )
    ),
    el(
      'article',
      {
        className: 'rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900',
      },
      el(CheckCircle2, { className: 'h-5 w-5 text-blue-600 dark:text-blue-400' }),
      el(
        'h3',
        { className: 'mt-3 font-display text-base font-semibold text-slate-900 dark:text-white' },
        'Excel va Word hisobotlar'
      ),
      el(
        'p',
        { className: 'mt-1.5 text-sm leading-relaxed text-slate-600 dark:text-slate-300' },
        "Sinflar bo'yicha ko'p varaqli XLSX reyting jadvali va individual o'quvchi Word varaqasini yuklab oling."
      )
    )
  );
}
