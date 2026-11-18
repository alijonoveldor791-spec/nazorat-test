import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Download, KeyRound, RefreshCw, ShieldAlert, Upload } from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { ConfirmDialog } from '../../components/ui/Modal';
import { PasswordInput } from '../../components/ui/PasswordInput';
import { useAdminSession } from '../../hooks/useAdminSession';
import { useToast } from '../../context/ToastContext';
import { ApiError, adminApi, adminPost, clearToken } from '../../lib/api';
import { downloadBlob, formatDateTime } from '../../lib/format';
import type { BackupArchiveItem, BackupStatus } from '../../types/api';

interface RestorePreview {
  previewId: string;
  fileHash: string;
  counts: { added: number; updated: number };
}

export function TeacherSettingsPage() {
  const { session, loading: sessionLoading } = useAdminSession('teacher');
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  const [archives, setArchives] = useState<BackupArchiveItem[]>([]);
  const [backupStatus, setBackupStatus] = useState<BackupStatus | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [restorePreview, setRestorePreview] = useState<RestorePreview | null>(null);
  const [clearConfirmOpen, setClearConfirmOpen] = useState(false);

  const loadBackupInfo = useCallback(async () => {
    setLoading(true);
    const nextWarnings: string[] = [];
    try {
      const [arch, status] = await Promise.all([
        adminApi<BackupArchiveItem[]>('backup-archives').catch((err) => {
          nextWarnings.push(err instanceof Error ? err.message : "Avtomatik zaxiralarni olib bo'lmadi.");
          return [];
        }),
        adminApi<BackupStatus>('backup-status').catch(() => null),
      ]);
      setArchives(arch);
      setBackupStatus(status);
      setWarnings(nextWarnings);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!sessionLoading && session) {
      loadBackupInfo();
    }
  }, [sessionLoading, session, loadBackupInfo]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordBusy(true);
    try {
      await adminPost('password', { currentPassword, newPassword });
      clearToken();
      toast('Parol yangilandi. Qayta kiring.');
      navigate('/oqituvchi/kirish', { replace: true });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Parolni o'zgartirib bo'lmadi.", true);
    } finally {
      setPasswordBusy(false);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const backup = await adminApi<unknown>('backup');
      const filename = `nazorat-zaxira-${new Date().toISOString().slice(0, 10)}.json`;
      downloadBlob(filename, JSON.stringify(backup, null, 2), 'application/json');
      toast('Zaxira tayyor.');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Zaxirani yuklab bo'lmadi.", true);
    }
  };

  const handleDownloadArchive = async (id: string) => {
    try {
      const backup = await adminApi<{ createdAt?: string }>(`backup-archives/${encodeURIComponent(id)}`);
      const filename = `nazorat-zaxira-${new Date(backup.createdAt || Date.now()).toISOString().slice(0, 10)}.json`;
      downloadBlob(filename, JSON.stringify(backup, null, 2), 'application/json');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Arxivni yuklab bo'lmadi.", true);
    }
  };

  const handleRestoreFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 4_000_000) throw new Error('Zaxira 4 MB dan oshmasin.');
      const parsed = JSON.parse(await file.text());
      const preview = await adminPost<RestorePreview>('restore-preview', parsed);
      setRestorePreview(preview);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Zaxira fayli yaroqsiz.", true);
    } finally {
      e.target.value = '';
    }
  };

  const handleConfirmRestore = async () => {
    if (!restorePreview) return;
    try {
      const res = await adminPost<{ report: { added: number; updated: number; errors: unknown[] } }>(
        'restore',
        { previewId: restorePreview.previewId, fileHash: restorePreview.fileHash }
      );
      setRestorePreview(null);
      toast(
        `${res.report.added} qo'shildi, ${res.report.updated} yangilandi, ${res.report.errors.length} xato.`
      );
      await loadBackupInfo();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Tiklashda xato yuz berdi.", true);
    }
  };

  const handleClearLegacy = async () => {
    try {
      await adminPost('clear', { confirmation: 'HAMMASINI OCHIRISH' });
      setClearConfirmOpen(false);
      toast("Ma'lumotlar tozalandi.");
      await loadBackupInfo();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Tozalashda xato yuz berdi.", true);
    }
  };

  const minLen = session?.passwordMinLength || 6;
  const maxLen = session?.passwordMaxLength || 128;

  const statusText = () => {
    if (!backupStatus) return null;
    if (backupStatus.status === 'not_started') return 'Avtomatik zaxira hali ishga tushirilmagan.';
    const labels: Record<string, string> = {
      running: 'bajarilmoqda',
      partial: 'qisman bajarildi',
      success: 'muvaffaqiyatli',
    };
    return `Oxirgi avtomatik zaxira: ${labels[backupStatus.status] || "noma'lum holat"}; ${backupStatus.created ?? 0} yaratildi, ${backupStatus.failed ?? 0} xato.`;
  };

  return (
    <AdminShell
      session={session}
      title="Sozlamalar"
      subtitle="Kirish paroli va maktab ma'lumotlari zaxirasini boshqaring."
      actions={
        <button
          type="button"
          onClick={loadBackupInfo}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Yangilash</span>
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2.5">
            <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Parolni o'zgartirish
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Yangi parol {minLen}–{maxLen} belgigacha bo'lsin. Saqlangach barcha eski sessiyalar tugaydi.
          </p>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <PasswordInput
              label="Joriy parol"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <PasswordInput
              label="Yangi parol"
              autoComplete="new-password"
              required
              minLength={minLen}
              maxLength={maxLen}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <button
              type="submit"
              disabled={passwordBusy}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {passwordBusy ? 'Saqlanmoqda...' : 'Yangi parolni saqlash'}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 dark:border-slate-800 dark:bg-slate-900">
          <div>
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Zaxira va tiklash
            </h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Testlar, sinflar va natijalar bitta JSON faylda. Parol va token kaliti zaxiraga kiritilmaydi.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            >
              <Download className="h-4 w-4" />
              <span>Zaxira nusxa yuklab olish</span>
            </button>

            <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200">
              <Upload className="h-4 w-4" />
              <span>Zaxiradan tiklash (.json)</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleRestoreFile}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Server faylni tekshiradi va qo'shish/yangilash sonini ko'rsatadi. Maktab admini faqat o'z maktabi zaxirasini tiklaydi.
          </p>

          {statusText() && (
            <p className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
              {statusText()}
            </p>
          )}

          {warnings.map((msg, i) => (
            <p key={i} role="alert" className="text-xs text-red-600 dark:text-red-400">
              {msg}
            </p>
          ))}

          {!loading && archives.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Avtomatik va himoya nusxalari
              </h3>
              <div className="space-y-2">
                {archives.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 px-3.5 py-2 text-xs dark:border-slate-800"
                  >
                    <span className="text-slate-700 dark:text-slate-200">
                      {formatDateTime(item.createdAt)} · {item.source}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDownloadArchive(item.id)}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Yuklab olish
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session?.role === 'school_admin' && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Faol urinishlar tugamaguncha tiklash boshlanmaydi.
            </p>
          )}

          {session?.role === 'legacy_admin' && (
            <div className="border-t border-slate-200 pt-4 space-y-2 dark:border-slate-800">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <ShieldAlert className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Ma'lumotlarni tozalash</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Bu amal maktabga biriktirilmagan eski sinflar, testlar, urinishlar va natijalarni o'chiradi. Avval zaxira oling.
              </p>
              <button
                type="button"
                onClick={() => setClearConfirmOpen(true)}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Eski ma'lumotlarni tozalash
              </button>
            </div>
          )}
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(restorePreview)}
        onClose={() => setRestorePreview(null)}
        onConfirm={handleConfirmRestore}
        title="Zaxira tekshirildi"
        message={
          restorePreview
            ? `${restorePreview.counts.added} ta yozuv qo'shiladi, ${restorePreview.counts.updated} ta yozuv yangilanadi. Davom etilsinmi?`
            : ''
        }
        confirmLabel="Tiklash"
      />

      <ConfirmDialog
        open={clearConfirmOpen}
        onClose={() => setClearConfirmOpen(false)}
        onConfirm={handleClearLegacy}
        title="Barcha ma'lumotlar o'chirilsinmi?"
        message="Sinf, test, urinish va natijalar qaytarib bo'lmaydigan tarzda o'chiriladi. Zaxira olinganiga ishonch hosil qiling."
        confirmLabel="O'chirish"
        danger
      />
    </AdminShell>
  );
}
