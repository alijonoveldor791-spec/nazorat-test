// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { memo as useMemo } from '../../core/state.js';
import { ApiError, adminApi, adminPost, getToken } from '../../core/api.js';
import { downloadBlob } from '../../core/format.js';
import { view28 } from './view28.js';
export function part4(scope) {
  scope.handleDownloadDocument = async (id, format, shared = false) => {
    try {
      const response = await fetch(
        `/api/admin/${shared ? 'shared-tests' : 'tests'}/${encodeURIComponent(id)}/document?format=${format}`,
        {
          headers: { Authorization: 'Bearer ' + getToken() },
          cache: 'no-store',
        }
      );
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Hujjatni yuklab bo'lmadi.");
      }
      if (format === 'pdf') {
        const html = (await response.text())
          .replaceAll('href="/', `href="${window.location.origin}/`)
          .replaceAll('src="/', `src="${window.location.origin}/`);
        const blobUrl = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        a.rel = 'noopener';
        a.click();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60000);
      } else {
        const blob = await response.blob();
        downloadBlob(
          format === 'key' ? 'javoblar-kaliti.docx' : 'test.docx',
          blob,
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        );
      }
    } catch (err) {
      scope.toast(err instanceof Error ? err.message : "Yuklab bo'lmadi.", true);
    }
  };
  scope.handlePublishOnline = async (e) => {
    e.preventDefault();
    if (!scope.publishTestId || !scope.pubClassId) {
      scope.toast('Sinf yoki guruhni tanlang.', true);
      return;
    }
    try {
      const cls = scope.classes.find((c) => c.id === scope.pubClassId);
      const res = await adminPost(`tests/${scope.publishTestId}/publish`, {
        classIds: [scope.pubClassId],
        direction: cls?.direction || '',
        settings: {
          timeLimitMin: scope.pubTime,
          maxAttempts: scope.pubAttempts,
          shuffleQuestions: scope.pubShuffleQ,
          shuffleOptions: scope.pubShuffleO,
        },
      });
      scope.setPublishTestId(null);
      scope.setPublishedCode(res.testCode?.value || null);
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : 'Onlayn berishda xato yuz berdi.', true);
    }
  };
  scope.handleDeleteSavedTest = async () => {
    if (!scope.deleteTestId) return;
    try {
      await adminApi(`tests/${encodeURIComponent(scope.deleteTestId)}`, { method: 'DELETE' });
      scope.setDeleteTestId(null);
      scope.toast("Test o'chirildi.");
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "O'chirib bo'lmadi.", true);
    }
  };
  scope.totalBankQuestions = useMemo(() => scope.topics.reduce((sum, t) => sum + t.count, 0), [scope.topics]);
  return { done: true, value: view28(scope) };
}
