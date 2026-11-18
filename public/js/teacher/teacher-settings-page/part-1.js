// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { ApiError, adminPost } from '../../core/api.js';
import { view4 } from './view4.js';
export function part1(scope) {
  scope.handleClearLegacy = async () => {
    try {
      await adminPost('clear', { confirmation: 'HAMMASINI OCHIRISH' });
      scope.setClearConfirmOpen(false);
      scope.toast("Ma'lumotlar tozalandi.");
      await scope.loadBackupInfo();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : 'Tozalashda xato yuz berdi.', true);
    }
  };
  scope.minLen = scope.session?.passwordMinLength || 6;
  scope.maxLen = scope.session?.passwordMaxLength || 128;
  scope.statusText = () => {
    if (!scope.backupStatus) return null;
    if (scope.backupStatus.status === 'not_started') return 'Avtomatik zaxira hali ishga tushirilmagan.';
    const labels = {
      running: 'bajarilmoqda',
      partial: 'qisman bajarildi',
      success: 'muvaffaqiyatli',
    };
    return `Oxirgi avtomatik zaxira: ${labels[scope.backupStatus.status] || "noma'lum holat"}; ${scope.backupStatus.created ?? 0} yaratildi, ${scope.backupStatus.failed ?? 0} xato.`;
  };
  return { done: true, value: view4(scope) };
}
