// Filtrlangan to'liq natijalar bo'yicha statistika va tanlov izohini ko'rsatadi.
import { el } from '../../core/dom.js';
import { STATUS_OPTIONS } from './result-status.js';
export function summaryView(scope) {
  const summary = scope.loading ? null : scope.summary;
  const count = (key) => (summary ? String(summary[key] ?? 0) : '—');
  const context = [
    scope.testOptions.find((test) => test.id === scope.testId)?.title,
    scope.classes.find((cls) => cls.id === scope.classId)?.name,
    STATUS_OPTIONS.find(([value]) => value === scope.status)?.[1],
    scope.search ? `Qidiruv: ${scope.search}` : '',
  ]
    .filter(Boolean)
    .join(' / ');
  const stats = [
    ['Testlar', count('tests'), summary ? `${summary.classes} ta sinf yoki guruh` : 'Yuklanmoqda...'],
    [
      'Ishtirokchilar',
      count('participants'),
      summary ? `${summary.submissions} ta topshirish` : 'Yuklanmoqda...',
    ],
    [
      "O'rtacha natija",
      summary?.averagePercent == null ? '—' : `${summary.averagePercent}%`,
      "Barcha filtrlangan topshirishlar bo'yicha",
    ],
  ];
  return el(
    'section',
    { 'aria-label': 'Natijalar statistikasi', className: 'results-summary' },
    el('p', { className: 'results-context' }, context || 'Barcha testlar, sinflar va guruhlar'),
    el(
      'div',
      { className: 'results-stat-grid', 'aria-live': 'polite' },
      stats.map(([label, value, hint]) =>
        el(
          'article',
          { key: label, className: 'results-stat' },
          el('p', null, label),
          el('strong', null, value),
          el('p', null, hint)
        )
      )
    ),
    scope.notice && el('p', { className: 'results-context', role: 'status' }, scope.notice)
  );
}
