// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { callback as useCallback, effect as useEffect, state as useState } from '../../core/state.js';
import { useNavigate } from '../../core/navigation.js';
import { useAdminSession } from '../../core/use-admin-session.js';
import { useToast } from '../../components/toast-context.js';
import { ApiError, adminApi, adminPost, clearToken } from '../../core/api.js';
import { downloadBlob } from '../../core/format.js';
export function part0(scope) {
  ({ session: scope.session, loading: scope.sessionLoading } = useAdminSession('teacher'));
  ({ toast: scope.toast } = useToast());
  scope.navigate = useNavigate();
  [scope.currentPassword, scope.setCurrentPassword] = useState('');
  [scope.newPassword, scope.setNewPassword] = useState('');
  [scope.passwordBusy, scope.setPasswordBusy] = useState(false);
  [scope.archives, scope.setArchives] = useState([]);
  [scope.backupStatus, scope.setBackupStatus] = useState(null);
  [scope.warnings, scope.setWarnings] = useState([]);
  [scope.loading, scope.setLoading] = useState(true);
  [scope.restorePreview, scope.setRestorePreview] = useState(null);
  [scope.clearConfirmOpen, scope.setClearConfirmOpen] = useState(false);
  scope.loadBackupInfo = useCallback(async () => {
    scope.setLoading(true);
    const nextWarnings = [];
    try {
      const [arch, status] = await Promise.all([
        adminApi('backup-archives').catch((err) => {
          nextWarnings.push(err instanceof Error ? err.message : "Avtomatik zaxiralarni olib bo'lmadi.");
          return [];
        }),
        adminApi('backup-status').catch(() => null),
      ]);
      scope.setArchives(arch);
      scope.setBackupStatus(status);
      scope.setWarnings(nextWarnings);
    } finally {
      scope.setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (!scope.sessionLoading && scope.session) {
      scope.loadBackupInfo();
    }
  }, [scope.sessionLoading, scope.session, scope.loadBackupInfo]);
  scope.handlePasswordChange = async (e) => {
    e.preventDefault();
    scope.setPasswordBusy(true);
    try {
      await adminPost('password', { currentPassword: scope.currentPassword, newPassword: scope.newPassword });
      clearToken();
      scope.toast('Parol yangilandi. Qayta kiring.');
      scope.navigate('/oqituvchi/kirish', { replace: true });
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Parolni o'zgartirib bo'lmadi.", true);
    } finally {
      scope.setPasswordBusy(false);
    }
  };
  scope.handleDownloadBackup = async () => {
    try {
      const backup = await adminApi('backup');
      const filename = `nazorat-zaxira-${new Date().toISOString().slice(0, 10)}.json`;
      downloadBlob(filename, JSON.stringify(backup, null, 2), 'application/json');
      scope.toast('Zaxira tayyor.');
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Zaxirani yuklab bo'lmadi.", true);
    }
  };
  scope.handleDownloadArchive = async (id) => {
    try {
      const backup = await adminApi(`backup-archives/${encodeURIComponent(id)}`);
      const filename = `nazorat-zaxira-${new Date(backup.createdAt || Date.now()).toISOString().slice(0, 10)}.json`;
      downloadBlob(filename, JSON.stringify(backup, null, 2), 'application/json');
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Arxivni yuklab bo'lmadi.", true);
    }
  };
  scope.handleRestoreFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 4000000) throw new Error('Zaxira 4 MB dan oshmasin.');
      const parsed = JSON.parse(await file.text());
      const preview = await adminPost('restore-preview', parsed);
      scope.setRestorePreview(preview);
    } catch (err) {
      scope.toast(err instanceof Error ? err.message : 'Zaxira fayli yaroqsiz.', true);
    } finally {
      e.target.value = '';
    }
  };
  scope.handleConfirmRestore = async () => {
    if (!scope.restorePreview) return;
    try {
      const res = await adminPost('restore', {
        previewId: scope.restorePreview.previewId,
        fileHash: scope.restorePreview.fileHash,
      });
      scope.setRestorePreview(null);
      scope.toast(
        `${res.report.added} qo'shildi, ${res.report.updated} yangilandi, ${res.report.errors.length} xato.`
      );
      await scope.loadBackupInfo();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : 'Tiklashda xato yuz berdi.', true);
    }
  };
}
