// Filtrlangan natijali testlarning qidiriladigan katalog oynasini ko'rsatadi.
import { el } from '../../core/dom.js';
import { Modal } from '../../components/ui/modal.js';
export function catalogueView(scope) {
  const search = scope.catalogueSearch.trim().toLocaleLowerCase('uz');
  const rows = (scope.summary?.catalogue || []).filter((row) =>
    `${row.testTitle} ${row.grade}`.toLocaleLowerCase('uz').includes(search)
  );
  return el(
    Modal,
    {
      open: scope.catalogueOpen,
      title: 'Natijasi mavjud testlar',
      onClose: () => scope.setCatalogueOpen(false),
    },
    el(
      'label',
      { className: 'results-catalogue-search' },
      'Testni qidirish',
      el('input', {
        type: 'search',
        value: scope.catalogueSearch,
        placeholder: 'Test nomi yoki sinf...',
        onChange: (event) => scope.setCatalogueSearch(event.target.value),
      })
    ),
    ...rows.map((test) =>
      el(
        'button',
        {
          key: test.testId,
          type: 'button',
          className: 'results-recent-item',
          onClick: () => {
            scope.selectTest(test.testId);
            scope.setCatalogueOpen(false);
          },
        },
        el('strong', null, test.testTitle),
        el('span', null, test.grade),
        el('span', null, `${test.count} ta topshirish`)
      )
    ),
    !rows.length && el('p', null, 'Test topilmadi.')
  );
}
