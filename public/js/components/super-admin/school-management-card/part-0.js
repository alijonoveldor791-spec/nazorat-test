// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { el } from '../../../core/dom.js';
import { state as useState } from '../../../core/state.js';
import { useToast } from '../../toast-context.js';
import { ApiError, superApi } from '../../../core/api.js';
import { fromTashkentInput, toTashkentInput } from '../../../core/format.js';
import { view0 } from './view0.js';
import { view1 } from './view1.js';
import { view2 } from './view2.js';
import { view3 } from './view3.js';
import { view4 } from './view4.js';
export function part0(scope) {
  ({ toast: scope.toast } = useToast());
  [scope.name, scope.setName] = useState(scope.school.name);
  [scope.region, scope.setRegion] = useState(scope.school.region || '');
  [scope.adminLogin, scope.setAdminLogin] = useState('');
  [scope.adminPassword, scope.setAdminPassword] = useState('');
  [scope.subStatus, scope.setSubStatus] = useState(scope.school.subscription?.status || 'active');
  [scope.endsAt, scope.setEndsAt] = useState(toTashkentInput(scope.school.subscription?.endsAt));
  [scope.busy, scope.setBusy] = useState(false);
  scope.handleSaveMeta = async (e) => {
    e.preventDefault();
    scope.setBusy(true);
    try {
      await superApi(`schools/${encodeURIComponent(scope.school.id)}`, {
        method: 'PUT',
        body: JSON.stringify({ name: scope.name.trim(), region: scope.region.trim() }),
      });
      scope.toast("O'zgarishlar saqlandi.");
      scope.onUpdated();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      scope.setBusy(false);
    }
  };
  scope.handleSaveAdmin = async (e) => {
    e.preventDefault();
    scope.setBusy(true);
    try {
      await superApi(`schools/${encodeURIComponent(scope.school.id)}/admin`, {
        method: 'POST',
        body: JSON.stringify({ login: scope.adminLogin.trim(), password: scope.adminPassword }),
      });
      scope.setAdminLogin('');
      scope.setAdminPassword('');
      scope.toast('Maktab admini saqlandi.');
      scope.onUpdated();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      scope.setBusy(false);
    }
  };
  scope.handleSaveSubscription = async (e) => {
    e.preventDefault();
    scope.setBusy(true);
    try {
      const iso = fromTashkentInput(scope.endsAt);
      if (!iso) throw new Error('Tugash sanasini kiriting.');
      await superApi(`schools/${encodeURIComponent(scope.school.id)}/subscription`, {
        method: 'PUT',
        body: JSON.stringify({ status: scope.subStatus, endsAt: iso }),
      });
      scope.toast('Obuna yangilandi.');
      scope.onUpdated();
    } catch (err) {
      scope.toast(err instanceof Error ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      scope.setBusy(false);
    }
  };
  return {
    done: true,
    value: el(
      'article',
      {
        className:
          'rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 dark:border-slate-800 dark:bg-slate-900',
      },
      el(
        'div',
        { className: 'flex flex-wrap items-start justify-between gap-3' },
        view0(scope),
        view1(scope)
      ),
      el(
        'div',
        { className: 'grid gap-4 border-t border-slate-100 pt-4 lg:grid-cols-3 dark:border-slate-800' },
        view2(scope),
        view3(scope),
        view4(scope)
      )
    ),
  };
}
