// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { callback as useCallback, effect as useEffect, state as useState } from '../../core/state.js';
import { useAdminSession } from '../../core/use-admin-session.js';
import { useToast } from '../../components/toast-context.js';
import { ApiError, superApi } from '../../core/api.js';
import { ACTIONS } from './shared.js';
export function part0(scope) {
  ({ session: scope.session, loading: scope.sessionLoading } = useAdminSession('super_admin'));
  ({ toast: scope.toast } = useToast());
  [scope.queue, scope.setQueue] = useState([]);
  [scope.policies, scope.setPolicies] = useState([]);
  [scope.loading, scope.setLoading] = useState(true);
  [scope.policyType, scope.setPolicyType] = useState('tariff');
  [scope.policyTarget, scope.setPolicyTarget] = useState('');
  [scope.policyTariff, scope.setPolicyTariff] = useState('');
  [scope.policyRules, scope.setPolicyRules] = useState({});
  [scope.policyBusy, scope.setPolicyBusy] = useState(false);
  [scope.reviewItem, scope.setReviewItem] = useState(null);
  [scope.reviewStatus, scope.setReviewStatus] = useState('approved');
  [scope.reviewTariffs, scope.setReviewTariffs] = useState('');
  [scope.reviewSchools, scope.setReviewSchools] = useState('');
  [scope.reviewBusy, scope.setReviewBusy] = useState(false);
  scope.loadData = useCallback(async () => {
    scope.setLoading(true);
    try {
      const [q, p] = await Promise.all([superApi('shared-tests'), superApi('bank-policies')]);
      scope.setQueue(q);
      scope.setPolicies(p);
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
  scope.handleSavePolicy = async (e) => {
    e.preventDefault();
    scope.setPolicyBusy(true);
    try {
      const rules = {};
      for (const [k, v] of Object.entries(scope.policyRules)) {
        if (v === 'true') rules[k] = true;
        else if (v === 'false') rules[k] = false;
      }
      await superApi('bank-policies', {
        method: 'PUT',
        body: JSON.stringify({
          type: scope.policyType,
          target: scope.policyTarget.trim(),
          tariffId: scope.policyTariff.trim(),
          rules,
        }),
      });
      scope.toast('Tarif / maktab istisnosi saqlandi.');
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      scope.setPolicyBusy(false);
    }
  };
  scope.loadPolicyIntoForm = (p) => {
    scope.setPolicyType(p.type);
    scope.setPolicyTarget(p.target);
    scope.setPolicyTariff(p.tariffId);
    const nextRules = {};
    for (const key of Object.keys(ACTIONS)) {
      nextRules[key] = p.rules[key] === undefined ? '' : p.rules[key] ? 'true' : 'false';
    }
    scope.setPolicyRules(nextRules);
  };
  scope.openReview = (item) => {
    scope.setReviewItem(item);
    scope.setReviewStatus(item.status === 'rejected' ? 'rejected' : 'approved');
    scope.setReviewTariffs((item.tariffIds || []).join(', '));
    scope.setReviewSchools((item.schoolIds || []).join(', '));
  };
  scope.handleSaveReview = async () => {
    if (!scope.reviewItem) return;
    scope.setReviewBusy(true);
    const splitIds = (raw) =>
      raw
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    try {
      await superApi(`shared-tests/${encodeURIComponent(scope.reviewItem.id)}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: scope.reviewStatus,
          tariffIds: splitIds(scope.reviewTariffs),
          schoolIds: splitIds(scope.reviewSchools),
        }),
      });
      scope.setReviewItem(null);
      scope.toast('Moderatsiya saqlandi.');
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      scope.setReviewBusy(false);
    }
  };
}
