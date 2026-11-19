// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { memo as useMemo } from '../../core/state.js';
import { ApiError, adminApi, adminPost } from '../../core/api.js';
import { downloadBlob } from '../../core/format.js';
import { view12 } from './view12.js';
export function part1(scope) {
  scope.handleExportAiken = async (id) => {
    try {
      const full = await adminApi(`tests/${id}`);
      if (full.questions.some((q) => q.contentFormat === 'rich-html-v1')) {
        scope.toast(
          "Word formatidagi rasm, jadval va formulalarni Aiken .txt fayliga yo'qotishsiz o'tkazib bo'lmaydi.",
          true
        );
        return;
      }
      const text = full.questions
        .map(
          (q) =>
            `${q.q}\n${q.options.map((o, idx) => `${'ABCDEF'[idx]}. ${o}`).join('\n')}\nANSWER: ${'ABCDEF'[q.answer ?? 0]}`
        )
        .join('\n\n');
      downloadBlob(`test-${id}.txt`, text);
      scope.toast('Aiken fayli tayyor.');
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Eksport qilib bo'lmadi.", true);
    }
  };
  scope.handleDeleteOne = async () => {
    if (!scope.deleteTarget) return;
    try {
      await adminApi(`tests/${scope.deleteTarget.id}`, { method: 'DELETE' });
      scope.setDeleteTarget(null);
      scope.toast("Test o'chirildi.");
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Testni o'chirib bo'lmadi.", true);
    }
  };
  scope.handleBulkDelete = async () => {
    const ids = scope.visibleTests.filter((t) => scope.selectedIds.has(t.id)).map((t) => t.id);
    if (!ids.length) return;
    try {
      for (const id of ids) {
        await adminApi(`tests/${id}`, { method: 'DELETE' });
      }
      scope.setBulkDeleteOpen(false);
      scope.setSelectedIds(new Set());
      scope.toast(`${ids.length} ta test o'chirildi.`);
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "O'chirishda xato yuz berdi.", true);
    }
  };
  scope.openAssignModal = (test) => {
    scope.setAssignTestItem(test);
    scope.setAssignDirection('');
    scope.setAssignClassIds(new Set());
  };
  scope.assignableClasses = useMemo(() => {
    if (!scope.assignTestItem) return [];
    return scope.classes.filter((c) => !scope.assignTestItem.classIds.includes(c.id));
  }, [scope.assignTestItem, scope.classes]);
  scope.assignDirections = useMemo(
    () =>
      Array.from(
        new Set(
          scope.assignableClasses.filter((c) => c.kind === 'group' && c.direction).map((c) => c.direction)
        )
      ),
    [scope.assignableClasses]
  );
  scope.handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!scope.assignTestItem) return;
    try {
      await adminPost(`tests/${scope.assignTestItem.id}/assign`, {
        direction: scope.assignDirection,
        classIds: Array.from(scope.assignClassIds),
      });
      scope.setAssignTestItem(null);
      scope.toast('Biriktirish saqlandi.');
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : 'Biriktirishda xato yuz berdi.', true);
    }
  };
  scope.allVisibleSelected =
    scope.visibleTests.length > 0 && scope.visibleTests.every((t) => scope.selectedIds.has(t.id));
  return { done: true, value: view12(scope) };
}
