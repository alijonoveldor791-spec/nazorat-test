// Natijalar sahifasining holati va filtrlarga mos server so'rovlarini tayyorlaydi.
import { callback, effect, reference, state } from '../../core/state.js';
import { useAdminSession } from '../../core/use-admin-session.js';
import { useToast } from '../../components/toast-context.js';
import { adminApi } from '../../core/api.js';
import { needsTest } from './result-status.js';

export function part0(scope) {
  ({ session: scope.session, loading: scope.sessionLoading } = useAdminSession('teacher'));
  ({ toast: scope.toast } = useToast());
  [scope.classes, scope.setClasses] = state([]);
  [scope.tests, scope.setTests] = state([]);
  [scope.overview, scope.setOverview] = state({ counts: null, recent: [], catalogue: [] });
  [scope.search, scope.setSearch] = state('');
  [scope.testId, scope.setTestId] = state('');
  [scope.classId, scope.setClassId] = state('');
  [scope.status, scope.setStatus] = state('submitted');
  [scope.sort, scope.setSort] = state('time');
  [scope.page, scope.setPage] = state(1);
  [scope.rows, scope.setRows] = state([]);
  [scope.summary, scope.setSummary] = state(null);
  [scope.notice, scope.setNotice] = state('');
  [scope.error, scope.setError] = state('');
  [scope.total, scope.setTotal] = state(0);
  [scope.pages, scope.setPages] = state(1);
  [scope.loading, scope.setLoading] = state(true);
  [scope.detailRow, scope.setDetailRow] = state(null);
  [scope.deleteTarget, scope.setDeleteTarget] = state(null);
  [scope.analysisData, scope.setAnalysisData] = state(null);
  [scope.analysisBusy, scope.setAnalysisBusy] = state(false);
  [scope.exportBusy, scope.setExportBusy] = state(false);
  [scope.catalogueOpen, scope.setCatalogueOpen] = state(false);
  [scope.catalogueSearch, scope.setCatalogueSearch] = state('');
  scope.request = reference({ version: 0, controller: null });
  scope.loadMetadata = callback(
    async (signal) => {
      try {
        const [classes, tests, overview] = await Promise.all([
          adminApi('classes', { signal }),
          adminApi('tests', { signal }),
          adminApi('results/overview', { signal }),
        ]);
        if (signal?.aborted) return;
        scope.setClasses(classes);
        scope.setTests(tests);
        scope.setOverview(overview);
      } catch (error) {
        if (!signal?.aborted) scope.toast(error.message || "Ma'lumotlar yuklanmadi.", true);
      }
    },
    [scope.toast]
  );
  scope.buildQuery = callback(
    (page, pageSize = 20) => {
      const params = new URLSearchParams({ page, pageSize, sort: scope.sort, status: scope.status });
      if (scope.search.trim()) params.set('search', scope.search.trim());
      if (scope.testId) params.set('testId', scope.testId);
      if (scope.classId) params.set('classId', scope.classId);
      return params.toString();
    },
    [scope.search, scope.testId, scope.classId, scope.sort, scope.status]
  );
  scope.loadResults = callback(async () => {
    const request = scope.request.current;
    const version = ++request.version;
    request.controller?.abort();
    const controller = (request.controller = new AbortController());
    scope.setLoading(true);
    scope.setError('');
    scope.setSummary(null);
    scope.setRows([]);
    try {
      const response = await adminApi(`results?${scope.buildQuery(scope.page)}`, {
        signal: controller.signal,
      });
      if (version !== request.version || controller.signal.aborted) return;
      scope.setRows(response.items || []);
      scope.setSummary(response.summary || null);
      scope.setNotice(response.notice || '');
      scope.setTotal(response.total || 0);
      scope.setPages(Math.max(1, response.pages || 1));
      if (response.page && response.page !== scope.page) scope.setPage(response.page);
    } catch (error) {
      if (version !== request.version || controller.signal.aborted) return;
      scope.setError(error.message || "Natijalarni yuklab bo'lmadi.");
      scope.setTotal(0);
    } finally {
      if (version === request.version && !controller.signal.aborted) scope.setLoading(false);
    }
  }, [scope.buildQuery, scope.page]);
  effect(() => {
    if (!scope.session || scope.sessionLoading) return;
    const controller = new AbortController();
    scope.loadMetadata(controller.signal);
    return () => controller.abort();
  }, [scope.sessionLoading, scope.session, scope.loadMetadata]);
  effect(() => {
    if (!scope.session || scope.sessionLoading) return;
    scope.setLoading(true);
    scope.setSummary(null);
    const timer = setTimeout(scope.loadResults, scope.search ? 250 : 0);
    return () => {
      clearTimeout(timer);
      scope.request.current.version++;
      scope.request.current.controller?.abort();
    };
  }, [scope.sessionLoading, scope.session, scope.loadResults]);
  scope.collectAllFiltered = async () => {
    const collected = [],
      ids = new Set();
    let page = 1,
      pages = 1;
    do {
      const batch = await adminApi(`results?${scope.buildQuery(page, 200)}`);
      if (batch.page !== page) break;
      for (const row of batch.items || [])
        if (!ids.has(row.id)) {
          ids.add(row.id);
          collected.push(row);
        }
      pages = batch.pages || 1;
      page++;
    } while (page <= pages);
    return collected;
  };
  scope.selectTest = (id) => {
    scope.setTestId(id);
    if (!id && needsTest(scope.status)) scope.setStatus('submitted');
    scope.setPage(1);
  };
  scope.resetFilters = () => {
    scope.setSearch('');
    scope.setTestId('');
    scope.setClassId('');
    scope.setStatus('submitted');
    scope.setSort('time');
    scope.setPage(1);
  };
}
