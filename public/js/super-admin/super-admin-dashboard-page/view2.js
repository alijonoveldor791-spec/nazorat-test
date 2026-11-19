// Sahifaning alohida ko'rinish qismini DOM elementlari sifatida tasvirlaydi.
import { el } from '../../core/dom.js';
import { copyToClipboard } from '../../core/format.js';
import { SchoolManagementCard } from '../../components/super-admin/school-management-card.js';
export function view2(scope) {
  return el(
    'div',
    { className: 'space-y-4' },
    scope.visibleSchools.map((school) =>
      el(SchoolManagementCard, {
        key: school.id,
        school: school,
        counts: scope.countsBySchool.get(school.id),
        copied: scope.copiedId === school.id,
        onCopyId: async () => {
          const code = school.public_school_id || school.id;
          const ok = await copyToClipboard(code);
          if (ok) {
            scope.setCopiedId(school.id);
            setTimeout(() => scope.setCopiedId((prev) => (prev === school.id ? null : prev)), 2000);
          } else {
            scope.toast('Nusxalanmadi.', true);
          }
        },
        onToggleStatus: () =>
          scope.setStatusTarget({
            school,
            next: school.status === 'blocked' ? 'active' : 'blocked',
          }),
        onUpdated: () => scope.loadData(),
      })
    )
  );
}
