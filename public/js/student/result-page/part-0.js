// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { el } from '../../core/dom.js';
import { effect as useEffect, state as useState } from '../../core/state.js';
import { useNavigate } from '../../core/navigation.js';
import { PublicHeader } from '../../components/layout/public-header.js';
import { api } from '../../core/api.js';
import { getBrowserKey, loadResult } from '../../core/attempt-storage.js';
import { view0 } from './view0.js';
import { view7 } from './view7.js';
export function part0(scope) {
  scope.navigate = useNavigate();
  [scope.saved, scope.setSaved] = useState(() => loadResult());
  [scope.refreshing, scope.setRefreshing] = useState(true);
  [scope.refreshFailed, scope.setRefreshFailed] = useState(false);
  scope.refresh = async (current) => {
    if (!current) {
      scope.navigate('/', { replace: true });
      return;
    }
    scope.setRefreshing(true);
    scope.setRefreshFailed(false);
    try {
      const remote = await api('attempts/resume', {
        method: 'POST',
        body: JSON.stringify({ attemptToken: current.attemptToken, browserKey: getBrowserKey() }),
      });
      if (remote.result) {
        const next = { ...current, result: remote.result };
        scope.setSaved(next);
        try {
          localStorage.setItem('nazorat-result-v2', JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }
    } catch {
      scope.setRefreshFailed(true);
    } finally {
      scope.setRefreshing(false);
    }
  };
  useEffect(() => {
    scope.refresh(scope.saved);
  }, []);
  if (!scope.saved) return { done: true, value: null };
  ({ result: scope.result, identity: scope.identity, title: scope.title } = scope.saved);
  scope.percent = scope.result.total ? Math.round((scope.result.score / scope.result.total) * 100) : 0;
  scope.correct = scope.result.results ? scope.result.results.filter(Boolean).length : scope.result.score;
  scope.wrong = scope.result.total - scope.correct;
  return {
    done: true,
    value: el(
      'div',
      { className: 'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100' },
      el(PublicHeader, { ctaLabel: 'Bosh sahifa', ctaTo: '/' }),
      el(
        'main',
        { className: 'mx-auto max-w-4xl space-y-6 px-4 py-10 sm:px-6' },
        scope.result.terminatedViolation &&
          el(
            'div',
            {
              role: 'status',
              className:
                'rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200',
            },
            'Qoidalar buzilgani sababli test avtomatik yakunlandi.'
          ),
        scope.result.hidden ? view0(scope) : view7(scope)
      )
    ),
  };
}
