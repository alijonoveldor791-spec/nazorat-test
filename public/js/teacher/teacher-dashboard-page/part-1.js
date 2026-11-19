// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { ApiError, adminApi, adminPost } from '../../core/api.js';
import { view8 } from './view8.js';
export function part1(scope) {
  scope.handleAllowRetake = async (id) => {
    try {
      await adminPost('results/' + encodeURIComponent(id) + '/retake');
      scope.toast('Qayta topshirishga ruxsat berildi.');
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : 'Ruxsat berishda xato yuz berdi.', true);
    }
  };
  scope.handleConfirmDelete = async () => {
    if (!scope.deleteTarget) return;
    try {
      await adminApi('results/' + encodeURIComponent(scope.deleteTarget), { method: 'DELETE' });
      scope.setDeleteTarget(null);
      scope.setDetailRow(null);
      scope.toast("Natija o'chirildi.");
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Natijani o'chirib bo'lmadi.", true);
    }
  };
  return { done: true, value: view8(scope) };
}
