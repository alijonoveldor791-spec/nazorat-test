// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { ArrowRight } from '../../components/icons.js';
import { view0 } from './view0.js';
export function view1(scope) {
  return el(
    'form',
    { onSubmit: scope.handleStart, className: 'mt-6 space-y-4' },
    el(
      'div',
      null,
      el('label', { className: 'block text-sm font-medium text-slate-700 dark:text-slate-200' }, 'Sinf'),
      el(
        'select',
        {
          value: scope.selectedClass,
          onChange: (e) => scope.setSelectedClass(e.target.value),
          className:
            'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
        },
        scope.classes.map((c) => el('option', { key: c.id, value: c.id }, c.name))
      )
    ),
    el(
      'div',
      null,
      el('label', { className: 'block text-sm font-medium text-slate-700 dark:text-slate-200' }, 'Test'),
      el(
        'select',
        {
          value: scope.selectedTest,
          onChange: (e) => scope.setSelectedTest(e.target.value),
          className:
            'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950',
        },
        scope.tests.length === 0 && el('option', { value: '' }, "Faol testlar yo'q"),
        scope.tests.map((t) =>
          el(
            'option',
            { key: t.id, value: t.id },
            t.title,
            ' (',
            t.questionCount ?? t.questions?.length ?? 0,
            ' savol)'
          )
        )
      )
    ),
    view0(scope),
    el(
      'div',
      null,
      el(
        'label',
        { className: 'block text-sm font-medium text-slate-700 dark:text-slate-200' },
        "Shaxsiy kod (agar ro'yxatli sinf bo'lsa)"
      ),
      el('input', {
        value: scope.accessCode,
        onChange: (e) => scope.setAccessCode(e.target.value),
        maxLength: 20,
        placeholder: 'Ixtiyoriy',
        className:
          'mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-950',
      })
    ),
    scope.error &&
      el(
        'p',
        { role: 'alert', className: 'text-sm font-medium text-red-600 dark:text-red-400' },
        scope.error
      ),
    el(
      'button',
      {
        type: 'submit',
        disabled: scope.busy || !scope.selectedTest,
        className:
          'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50',
      },
      el('span', null, scope.busy ? 'Boshlanmoqda...' : 'Testni boshlash'),
      el(ArrowRight, { className: 'h-4 w-4' })
    )
  );
}
