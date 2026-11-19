// Tanlangan filtrlar bo'yicha so'nggi beshta test va katalogni ko'rsatadi.
import { el } from '../../core/dom.js';
export function view1(scope) {
  const rows = scope.loading ? [] : scope.summary?.recent || [];
  return el(
    'aside',
    { className: 'results-recent no-print', 'aria-label': "So'nggi testlar" },
    el(
      'div',
      { className: 'results-section-heading' },
      el('h2', null, "So'nggi testlar"),
      el(
        'button',
        {
          type: 'button',
          onClick: () => scope.refresh(),
          disabled: scope.loading,
          className: 'results-link',
        },
        'Yangilash'
      )
    ),
    el('p', { className: 'results-context' }, "Tanlangan filtrlar bo'yicha"),
    ...rows.map((test) =>
      el(
        'button',
        {
          key: test.testId,
          type: 'button',
          className: 'results-recent-item',
          onClick: () => scope.selectTest(test.testId),
          'aria-pressed': scope.testId === test.testId,
        },
        el('strong', null, test.testTitle),
        el('span', null, test.grade),
        el('span', null, `${test.count} ta topshirish`)
      )
    ),
    !rows.length &&
      el('p', { className: 'results-context' }, scope.loading ? 'Yuklanmoqda...' : 'Test topilmadi.'),
    el(
      'button',
      {
        type: 'button',
        className: 'results-secondary',
        disabled: scope.loading,
        onClick: () => {
          scope.setCatalogueSearch('');
          scope.setCatalogueOpen(true);
        },
      },
      "Barcha testlarni ko'rish"
    )
  );
}
