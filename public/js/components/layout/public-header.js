// Sahifaning ko'rinishi va amallarini mahalliy DOM orqali boshqaradi.
import { el } from '../../core/dom.js';
import { Link } from '../../core/navigation.js';
export function PublicHeader({ ctaLabel = "Testga o'tish", ctaTo = '/test-kirish' }) {
  return el(
    'header',
    {
      className:
        'sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90',
    },
    el(
      'div',
      { className: 'mx-auto flex max-w-6xl items-center justify-between gap-8 px-4 py-3.5 sm:px-6' },
      el(
        Link,
        {
          to: '/',
          className:
            'font-display text-xl font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 dark:text-white',
        },
        'Nazorat'
      ),
      el(
        'nav',
        {
          'aria-label': 'Asosiy navigatsiya',
          className:
            'hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300',
        },
        el(
          'a',
          {
            href: '/#qadamlar',
            className:
              'whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline underline-offset-4 dark:hover:text-white',
          },
          'Qanday ishlaydi'
        ),
        el(
          'a',
          {
            href: '/#imkoniyatlar',
            className:
              'whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline underline-offset-4 dark:hover:text-white',
          },
          'Imkoniyatlar'
        ),
        el(
          Link,
          {
            to: '/eski-testlar',
            className:
              'whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline underline-offset-4 dark:hover:text-white',
          },
          'Ochiq testlar'
        ),
        el(
          Link,
          {
            to: '/oqituvchi/kirish',
            className:
              'whitespace-nowrap shrink-0 transition-colors hover:text-slate-900 hover:underline underline-offset-4 dark:hover:text-white',
          },
          'Maktab kirishi'
        )
      ),
      el(
        'div',
        { className: 'flex items-center shrink-0' },
        el(
          Link,
          {
            to: ctaTo,
            className:
              'inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white whitespace-nowrap shrink-0 transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500',
          },
          ctaLabel
        )
      )
    )
  );
}
