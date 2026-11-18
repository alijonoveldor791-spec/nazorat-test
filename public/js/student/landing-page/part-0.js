// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { el } from '../../core/dom.js';
import { effect as useEffect } from '../../core/state.js';
import { useNavigate, useSearchParams } from '../../core/navigation.js';
import { PublicHeader } from '../../components/layout/public-header.js';
import { useTheme } from '../../components/theme-context.js';
import { view5 } from './view5.js';
import { view6 } from './view6.js';
export function part0(scope) {
  [scope.params] = useSearchParams();
  scope.navigate = useNavigate();
  ({ theme: scope.theme, toggleTheme: scope.toggleTheme } = useTheme());
  useEffect(() => {
    if (scope.params.get('legacy') === '1') {
      scope.navigate('/eski-testlar', { replace: true });
    } else if (scope.params.has('schoolId')) {
      scope.navigate('/test-kirish?' + scope.params.toString(), { replace: true });
    }
  }, [scope.params, scope.navigate]);
  return {
    done: true,
    value: el(
      'div',
      { className: 'min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100' },
      el(PublicHeader, null),
      view5(scope),
      el(
        'footer',
        { className: 'mt-12 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900' },
        view6(scope)
      )
    ),
  };
}
