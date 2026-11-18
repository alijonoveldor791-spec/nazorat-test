// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import {
  callback as useCallback,
  effect as useEffect,
  memo as useMemo,
  state as useState,
} from '../../core/state.js';
import { useNavigate } from '../../core/navigation.js';
import { useAdminSession } from '../../core/use-admin-session.js';
import { useToast } from '../../components/toast-context.js';
import { ApiError, adminApi, adminPost } from '../../core/api.js';
import { copyToClipboard } from '../../core/format.js';
export function part0(scope) {
  ({ session: scope.session, loading: scope.sessionLoading } = useAdminSession('teacher'));
  ({ toast: scope.toast } = useToast());
  scope.navigate = useNavigate();
  [scope.tests, scope.setTests] = useState([]);
  [scope.classes, scope.setClasses] = useState([]);
  [scope.loading, scope.setLoading] = useState(true);
  [scope.audience, scope.setAudience] = useState('all');
  [scope.query, scope.setQuery] = useState('');
  [scope.statusFilter, scope.setStatusFilter] = useState('');
  [scope.sortOrder, scope.setSortOrder] = useState('newest');
  [scope.viewMode, scope.setViewMode] = useState('cards');
  [scope.selectedIds, scope.setSelectedIds] = useState(new Set());
  [scope.copiedId, scope.setCopiedId] = useState(null);
  [scope.assignTestItem, scope.setAssignTestItem] = useState(null);
  [scope.assignDirection, scope.setAssignDirection] = useState('');
  [scope.assignClassIds, scope.setAssignClassIds] = useState(new Set());
  [scope.deleteTarget, scope.setDeleteTarget] = useState(null);
  [scope.bulkDeleteOpen, scope.setBulkDeleteOpen] = useState(false);
  [scope.codeConfirm, scope.setCodeConfirm] = useState(null);
  scope.loadData = useCallback(async () => {
    scope.setLoading(true);
    try {
      const [tst, cls] = await Promise.all([adminApi('tests'), adminApi('classes')]);
      scope.setTests(tst);
      scope.setClasses(cls);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Testlarni yuklab bo'lmadi.", true);
    } finally {
      scope.setLoading(false);
    }
  }, [scope.toast]);
  useEffect(() => {
    if (!scope.sessionLoading && scope.session) {
      scope.loadData();
    }
  }, [scope.sessionLoading, scope.session, scope.loadData]);
  scope.classMap = useMemo(() => new Map(scope.classes.map((c) => [c.id, c])), [scope.classes]);
  scope.visibleTests = useMemo(() => {
    return scope.tests
      .filter((t) => {
        if (scope.audience === 'all') return true;
        return t.classIds.some((id) => (scope.classMap.get(id)?.kind || 'class') === scope.audience);
      })
      .filter(
        (t) =>
          t.title.toLowerCase().includes(scope.query.trim().toLowerCase()) &&
          (!scope.statusFilter || t.status === scope.statusFilter)
      )
      .sort(
        (a, b) =>
          (scope.sortOrder === 'oldest' ? 1 : -1) *
          String(a.createdAt || a.created || '').localeCompare(String(b.createdAt || b.created || ''))
      );
  }, [scope.tests, scope.audience, scope.classMap, scope.query, scope.statusFilter, scope.sortOrder]);
  scope.handleCopyCode = async (test) => {
    if (!test.testCode?.value) return;
    const ok = await copyToClipboard(test.testCode.value);
    if (ok) {
      scope.setCopiedId(test.id);
      setTimeout(() => scope.setCopiedId((prev) => (prev === test.id ? null : prev)), 2000);
    } else {
      scope.toast("Nusxalanmadi. Kartadagi kodni qo'lda yozib oling.", true);
    }
  };
  scope.handleCodeAction = async (test, action) => {
    if (!test.testCode) return;
    try {
      await adminPost(`tests/${test.id}/code`, { action, version: test.testCode.version });
      scope.setCodeConfirm(null);
      scope.toast('Kod holati saqlandi.');
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Kod holatini o'zgartirib bo'lmadi.", true);
    }
  };
  scope.handleToggle = async (id) => {
    try {
      await adminPost(`tests/${id}/toggle`);
      scope.toast('Test holati yangilandi.');
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Holatni o'zgartirib bo'lmadi.", true);
    }
  };
  scope.handleDuplicate = async (id) => {
    try {
      await adminPost(`tests/${id}/duplicate`);
      scope.toast('Test nusxasi yaratildi.');
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Nusxa olib bo'lmadi.", true);
    }
  };
}
