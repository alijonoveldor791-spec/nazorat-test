// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { memo as useMemo } from '../../core/state.js';
import { ApiError, adminApi } from '../../core/api.js';
import { normalizeName } from './shared.js';
import { view9 } from './view9.js';
export function part1(scope) {
  scope.handleDeleteOne = async () => {
    if (!scope.deleteTarget) return;
    try {
      await adminApi(`classes/${scope.deleteTarget.id}`, { method: 'DELETE' });
      scope.setDeleteTarget(null);
      scope.setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(scope.deleteTarget.id);
        return next;
      });
      scope.toast("Sinf o'chirildi.");
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Sinfni o'chirib bo'lmadi.", true);
    }
  };
  scope.handleBulkDelete = async () => {
    const ids = scope.visibleClasses.filter((c) => scope.selectedIds.has(c.id)).map((c) => c.id);
    if (!ids.length) return;
    try {
      for (const id of ids) {
        await adminApi(`classes/${id}`, { method: 'DELETE' });
      }
      scope.setBulkDeleteOpen(false);
      scope.setSelectedIds(new Set());
      scope.toast(`${ids.length} ta sinf o'chirildi.`);
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "O'chirishda xato yuz berdi.", true);
    }
  };
  scope.toggleSelectAll = () => {
    if (scope.visibleClasses.length > 0 && scope.visibleClasses.every((c) => scope.selectedIds.has(c.id))) {
      scope.setSelectedIds(new Set());
    } else {
      scope.setSelectedIds(new Set(scope.visibleClasses.map((c) => c.id)));
    }
  };
  scope.toggleSelectOne = (id) => {
    scope.setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  scope.progressStats = useMemo(() => {
    if (!scope.progressModalClass) return [];
    const students = scope.progressModalClass.students || [];
    const classTests = scope.tests.filter((t) => t.classIds.includes(scope.progressModalClass.id));
    return classTests.map((test) => {
      const rows = scope.results.filter(
        (row) =>
          row.testId === test.id &&
          (row.classId === scope.progressModalClass.id ||
            normalizeName(row.grade) === normalizeName(scope.progressModalClass.name))
      );
      const missing = students.filter(
        (student) =>
          !rows.some((row) =>
            row.studentId
              ? row.studentId === student.id
              : normalizeName(`${row.surname} ${row.name}`) ===
                normalizeName(`${student.surname} ${student.name}`)
          )
      );
      return { test, submitted: students.length - missing.length, total: students.length, missing };
    });
  }, [scope.progressModalClass, scope.tests, scope.results]);
  scope.allVisibleSelected =
    scope.visibleClasses.length > 0 && scope.visibleClasses.every((c) => scope.selectedIds.has(c.id));
  return { done: true, value: view9(scope) };
}
