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
import { ApiError, adminApi, getToken } from '../../core/api.js';
import { downloadBlob, percent } from '../../core/format.js';
export function part0(scope) {
  ({ session: scope.session, loading: scope.sessionLoading } = useAdminSession('teacher'));
  ({ toast: scope.toast } = useToast());
  scope.navigate = useNavigate();
  [scope.classes, scope.setClasses] = useState([]);
  [scope.tests, scope.setTests] = useState([]);
  [scope.results, scope.setResults] = useState([]);
  [scope.loading, scope.setLoading] = useState(true);
  [scope.detailRow, scope.setDetailRow] = useState(null);
  [scope.detailLoading, scope.setDetailLoading] = useState(false);
  [scope.deleteTarget, scope.setDeleteTarget] = useState(null);
  scope.loadData = useCallback(async () => {
    scope.setLoading(true);
    try {
      const [cls, tst, res] = await Promise.all([
        adminApi('classes'),
        adminApi('tests'),
        adminApi('results'),
      ]);
      scope.setClasses(cls);
      scope.setTests(tst);
      scope.setResults(res);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi.", true);
    } finally {
      scope.setLoading(false);
    }
  }, [scope.toast]);
  useEffect(() => {
    if (!scope.sessionLoading && scope.session) {
      scope.loadData();
    }
  }, [scope.sessionLoading, scope.session, scope.loadData]);
  scope.metrics = useMemo(() => {
    const todayDate = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' });
    const todayCount = scope.results.filter(
      (r) => new Date(r.time).toLocaleDateString('en-CA', { timeZone: 'Asia/Tashkent' }) === todayDate
    ).length;
    const activeTestsCount = scope.tests.filter((t) => t.status === 'active').length;
    const avg = scope.results.length
      ? Math.round(scope.results.reduce((sum, row) => sum + percent(row), 0) / scope.results.length)
      : null;
    return { todayCount, activeTestsCount, classesCount: scope.classes.length, avg };
  }, [scope.results, scope.tests, scope.classes]);
  scope.recentResults = useMemo(
    () => [...scope.results].sort((a, b) => String(b.time).localeCompare(String(a.time))).slice(0, 5),
    [scope.results]
  );
  scope.classChartData = useMemo(() => {
    const grouped = new Map();
    for (const r of scope.results) {
      const key = r.grade || 'Belgilanmagan';
      const entry = grouped.get(key) || { name: key, totalPct: 0, count: 0 };
      entry.totalPct += percent(r);
      entry.count += 1;
      grouped.set(key, entry);
    }
    return Array.from(grouped.values())
      .map((item) => ({ ...item, avg: Math.round(item.totalPct / item.count) }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 8);
  }, [scope.results]);
  scope.openDetail = async (id) => {
    scope.setDetailLoading(true);
    try {
      const row = await adminApi('results/' + encodeURIComponent(id));
      scope.setDetailRow(row);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Natija tafsilotini yuklab bo'lmadi.", true);
    } finally {
      scope.setDetailLoading(false);
    }
  };
  scope.handleDownloadWord = async (id) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch('/api/admin/results/' + encodeURIComponent(id) + '/word', {
        headers: { Authorization: 'Bearer ' + getToken() },
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Word faylni yuklab bo'lmadi.");
      }
      const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      let filename = 'test-varaqasi.docx';
      const encoded = /filename\*=UTF-8''([^;]+)/i.exec(
        response.headers.get('content-disposition') || ''
      )?.[1];
      if (encoded) {
        try {
          filename = decodeURIComponent(encoded);
        } catch {
          // keep default
        }
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      downloadBlob(filename, bytes, mime);
      scope.toast('Word varaqasi yuklandi.');
    } catch (err) {
      scope.toast(
        err instanceof Error && err.name === 'AbortError'
          ? "Word faylni tayyorlash vaqti tugadi. Qayta urinib ko'ring."
          : err instanceof Error
            ? err.message
            : "Word faylni yuklab bo'lmadi.",
        true
      );
    } finally {
      clearTimeout(timer);
    }
  };
}
