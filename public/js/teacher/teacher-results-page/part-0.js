// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { callback as useCallback, effect as useEffect, state as useState } from '../../core/state.js';
import { useAdminSession } from '../../core/use-admin-session.js';
import { useToast } from '../../components/toast-context.js';
import { ApiError, adminApi } from '../../core/api.js';
export function part0(scope) {
  ({ session: scope.session, loading: scope.sessionLoading } = useAdminSession('teacher'));
  ({ toast: scope.toast } = useToast());
  [scope.classes, scope.setClasses] = useState([]);
  [scope.tests, scope.setTests] = useState([]);
  [scope.overview, scope.setOverview] = useState({
    counts: null,
    recent: [],
    catalogue: [],
  });
  [scope.search, scope.setSearch] = useState('');
  [scope.testId, scope.setTestId] = useState('');
  [scope.classId, scope.setClassId] = useState('');
  [scope.sort, scope.setSort] = useState('time');
  [scope.page, scope.setPage] = useState(1);
  [scope.rows, scope.setRows] = useState([]);
  [scope.total, scope.setTotal] = useState(0);
  [scope.pages, scope.setPages] = useState(1);
  [scope.loading, scope.setLoading] = useState(true);
  [scope.detailRow, scope.setDetailRow] = useState(null);
  [scope.deleteTarget, scope.setDeleteTarget] = useState(null);
  [scope.analysisData, scope.setAnalysisData] = useState(null);
  [scope.analysisBusy, scope.setAnalysisBusy] = useState(false);
  [scope.exportBusy, scope.setExportBusy] = useState(false);
  scope.loadMetadata = useCallback(async () => {
    try {
      const [cls, tst, ov] = await Promise.all([
        adminApi('classes'),
        adminApi('tests'),
        adminApi('results/overview'),
      ]);
      scope.setClasses(cls);
      scope.setTests(tst);
      scope.setOverview(ov);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi.", true);
    }
  }, [scope.toast]);
  scope.buildQuery = useCallback(
    (p, pageSize = 20) => {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(pageSize),
        sort: scope.sort,
      });
      if (scope.search.trim()) params.set('search', scope.search.trim());
      if (scope.testId) params.set('testId', scope.testId);
      if (scope.classId) params.set('classId', scope.classId);
      return params.toString();
    },
    [scope.search, scope.testId, scope.classId, scope.sort]
  );
  scope.loadResults = useCallback(async () => {
    scope.setLoading(true);
    try {
      const res = await adminApi(`results?${scope.buildQuery(scope.page, 20)}`);
      scope.setRows(res.items || []);
      scope.setTotal(res.total || 0);
      scope.setPages(Math.max(1, res.pages || 1));
      if (res.page && res.page !== scope.page) scope.setPage(res.page);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Natijalarni yuklab bo'lmadi.", true);
    } finally {
      scope.setLoading(false);
    }
  }, [scope.buildQuery, scope.page, scope.toast]);
  useEffect(() => {
    if (!scope.sessionLoading && scope.session) {
      scope.loadMetadata();
    }
  }, [scope.sessionLoading, scope.session, scope.loadMetadata]);
  useEffect(() => {
    if (!scope.sessionLoading && scope.session) {
      scope.loadResults();
    }
  }, [scope.sessionLoading, scope.session, scope.loadResults]);
  scope.collectAllFiltered = async () => {
    const collected = [];
    const ids = new Set();
    let p = 1;
    let totalPages = 1;
    do {
      const batch = await adminApi(`results?${scope.buildQuery(p, 200)}`);
      if (batch.page !== p) break;
      for (const r of batch.items || []) {
        if (!ids.has(r.id)) {
          ids.add(r.id);
          collected.push(r);
        }
      }
      totalPages = batch.pages || 1;
      p += 1;
    } while (p <= totalPages);
    return collected;
  };
}
