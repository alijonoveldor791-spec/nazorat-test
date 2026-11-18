// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { ApiError, api, clearToken, getToken } from '../../core/api.js';
import { view8 } from './view8.js';
export function part1(scope) {
  scope.handleRootPassword = async (e) => {
    e.preventDefault();
    scope.setRootBusy(true);
    try {
      await api('admin/password', {
        token: getToken(),
        method: 'POST',
        body: JSON.stringify({ currentPassword: scope.rootCurrent, newPassword: scope.rootNext }),
      });
      clearToken();
      scope.toast('Parol yangilandi. Qayta kiring.');
      scope.navigate('/oqituvchi/kirish', { replace: true });
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Parolni o'zgartirib bo'lmadi.", true);
    } finally {
      scope.setRootBusy(false);
    }
  };
  return { done: true, value: view8(scope) };
}
