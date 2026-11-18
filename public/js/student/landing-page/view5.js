// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ResumeAttemptBanner } from '../../components/student/resume-attempt-banner.js';
import { FOCUS_IMG } from './shared.js';
import { view0 } from './view0.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
import { view3 } from './view3.js';
import { view4 } from './view4.js';
export function view5(scope) {
  return el(
    'main',
    { className: 'mx-auto max-w-6xl space-y-20 px-4 py-10 sm:px-6 lg:py-14' },
    el(ResumeAttemptBanner, null),
    el(
      'section',
      { 'aria-labelledby': 'hero-title', className: 'grid items-stretch gap-10 lg:grid-cols-12 lg:gap-12' },
      view0(scope),
      el('div', { className: 'lg:col-span-6' }, view1(scope))
    ),
    view2(scope),
    el(
      'section',
      { id: 'qadamlar', 'aria-labelledby': 'steps-title', className: 'space-y-8' },
      el(
        'div',
        { className: 'max-w-2xl' },
        el(
          'h2',
          {
            id: 'steps-title',
            className:
              'font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl dark:text-white',
          },
          'Nazorat qanday ishlaydi'
        ),
        el(
          'p',
          { className: 'mt-2 text-base text-slate-600 dark:text-slate-300' },
          'Uchta sodda bosqich bilan testni boshlang va darhol tahlil oling.'
        )
      ),
      view3(scope)
    ),
    el(
      'section',
      { id: 'imkoniyatlar', 'aria-labelledby': 'features-title', className: 'grid gap-8 lg:grid-cols-12' },
      el(
        'div',
        {
          className:
            'overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900',
        },
        el('img', {
          src: FOCUS_IMG,
          alt: 'Tinch kutubxonada test tayyorgarligi',
          referrerPolicy: 'no-referrer',
          className: 'h-full min-h-[260px] w-full object-cover',
        })
      ),
      view4(scope)
    )
  );
}
