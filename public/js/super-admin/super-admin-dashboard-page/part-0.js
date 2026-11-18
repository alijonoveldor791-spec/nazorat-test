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
import { ApiError, superApi } from '../../core/api.js';
export function part0(scope) {
  ({ session: scope.session, loading: scope.sessionLoading } = useAdminSession('super_admin'));
  ({ toast: scope.toast } = useToast());
  scope.navigate = useNavigate();
  [scope.tab, scope.setTab] = useState('schools');
  [scope.schools, scope.setSchools] = useState([]);
  [scope.stats, scope.setStats] = useState(null);
  [scope.loading, scope.setLoading] = useState(true);
  [scope.searchQuery, scope.setSearchQuery] = useState('');
  [scope.statusFilter, scope.setStatusFilter] = useState('');
  [scope.copiedId, scope.setCopiedId] = useState(null);
  [scope.newName, scope.setNewName] = useState('');
  [scope.newRegion, scope.setNewRegion] = useState('');
  [scope.createBusy, scope.setCreateBusy] = useState(false);
  [scope.statusTarget, scope.setStatusTarget] = useState(null);
  [scope.rootCurrent, scope.setRootCurrent] = useState('');
  [scope.rootNext, scope.setRootNext] = useState('');
  [scope.rootBusy, scope.setRootBusy] = useState(false);
  scope.loadData = useCallback(
    async (q = scope.searchQuery) => {
      scope.setLoading(true);
      try {
        const path = q.trim() ? `schools?q=${encodeURIComponent(q.trim())}` : 'schools';
        const [rows, statistics] = await Promise.all([superApi(path), superApi('statistics')]);
        scope.setSchools(rows);
        scope.setStats(statistics);
      } catch (err) {
        scope.toast(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi.", true);
      } finally {
        scope.setLoading(false);
      }
    },
    [scope.searchQuery, scope.toast]
  );
  useEffect(() => {
    if (!scope.sessionLoading && scope.session) {
      scope.loadData('');
    }
  }, [scope.sessionLoading, scope.session, scope.loadData]);
  scope.countsBySchool = useMemo(
    () => new Map((scope.stats?.bySchool || []).map((r) => [r.schoolId, r])),
    [scope.stats]
  );
  scope.visibleSchools = useMemo(
    () => scope.schools.filter((s) => !scope.statusFilter || s.status === scope.statusFilter),
    [scope.schools, scope.statusFilter]
  );
  scope.handleCreateSchool = async (e) => {
    e.preventDefault();
    scope.setCreateBusy(true);
    try {
      const requestId =
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      await superApi('schools', {
        method: 'POST',
        body: JSON.stringify({
          name: scope.newName.trim(),
          region: scope.newRegion.trim(),
          requestId,
        }),
      });
      scope.setNewName('');
      scope.setNewRegion('');
      scope.setSearchQuery('');
      scope.setStatusFilter('');
      scope.toast('Maktab yaratildi.');
      scope.setTab('schools');
      await scope.loadData('');
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Maktab yaratib bo'lmadi.", true);
    } finally {
      scope.setCreateBusy(false);
    }
  };
  scope.handleToggleSchoolStatus = async () => {
    if (!scope.statusTarget) return;
    try {
      await superApi(`schools/${encodeURIComponent(scope.statusTarget.school.id)}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: scope.statusTarget.next }),
      });
      scope.setStatusTarget(null);
      scope.toast("Maktab holati o'zgartirildi.");
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Holatni o'zgartirib bo'lmadi.", true);
    }
  };
}
