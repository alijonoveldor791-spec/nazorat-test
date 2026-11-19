// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { ApiError, adminApi, adminPost, getToken } from '../../core/api.js';
import { downloadBlob } from '../../core/format.js';
import { exportResultsFile } from '../../core/xlsx.js';
import { view14 } from './view14.js';
import { printResults } from './print-results.js';
export function part1(scope) {
  scope.handleExport = async (excel) => {
    scope.setExportBusy(true);
    try {
      const allRows = await scope.collectAllFiltered();
      exportResultsFile(
        allRows,
        scope.tests,
        scope.classes,
        { search: scope.search, classId: scope.classId, status: scope.status },
        excel
      );
      scope.toast('Eksport tayyor.');
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Eksport qilib bo'lmadi.", true);
    } finally {
      scope.setExportBusy(false);
    }
  };
  scope.openAnalysis = async () => {
    const targetId = scope.testId;
    if (!targetId) {
      scope.toast('Tahlil uchun test tanlang.', true);
      return;
    }
    scope.setAnalysisBusy(true);
    try {
      const query = new URLSearchParams(scope.buildQuery(1));
      query.set('testId', targetId);
      const data = await adminApi(`analysis?${query}`);
      scope.setAnalysisData(data);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Tahlilni yuklab bo'lmadi.", true);
    } finally {
      scope.setAnalysisBusy(false);
    }
  };
  scope.openDetail = async (id) => {
    try {
      const full = await adminApi(`results/${encodeURIComponent(id)}`);
      scope.setDetailRow(full);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Natija tafsilotini yuklab bo'lmadi.", true);
    }
  };
  scope.handleDownloadWord = async (id) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(`/api/admin/results/${encodeURIComponent(id)}/word`, {
        headers: { Authorization: 'Bearer ' + getToken() },
        signal: controller.signal,
        cache: 'no-store',
      });
      if (!response.ok) {
        const err = await response.json().catch(() => null);
        throw new Error(err?.error || "Word faylni yuklab bo'lmadi.");
      }
      const mime = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      let filename = 'test-varaqasi.docx';
      const encoded = /filename\*=UTF-8''([^;]+)/i.exec(
        response.headers.get('content-disposition') || ''
      )?.[1];
      if (encoded) {
        try {
          filename = decodeURIComponent(encoded);
        } catch {
          // keep default
        }
      }
      const bytes = new Uint8Array(await response.arrayBuffer());
      downloadBlob(filename, bytes, mime);
      scope.toast('Word varaqasi yuklandi.');
    } catch (err) {
      scope.toast(err instanceof Error ? err.message : "Word faylni yuklab bo'lmadi.", true);
    } finally {
      clearTimeout(timer);
    }
  };
  scope.handleAllowRetake = async (id) => {
    try {
      await adminPost(`results/${encodeURIComponent(id)}/retake`);
      scope.toast('Qayta topshirishga ruxsat berildi.');
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : 'Xato yuz berdi.', true);
    }
  };
  scope.handleDelete = async () => {
    if (!scope.deleteTarget) return;
    try {
      await adminApi(`results/${encodeURIComponent(scope.deleteTarget)}`, { method: 'DELETE' });
      scope.setDeleteTarget(null);
      scope.setDetailRow(null);
      scope.toast("Natija o'chirildi.");
      await Promise.all([scope.loadResults(), scope.loadMetadata()]);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Natijani o'chirib bo'lmadi.", true);
    }
  };
  scope.testOptions = [
    ...new Map([
      ...scope.tests.map((test) => [test.id, { id: test.id, title: test.title }]),
      ...[...(scope.overview.catalogue || []), ...(scope.summary?.catalogue || [])].map((test) => [
        test.testId || test.id,
        { id: test.testId || test.id, title: test.testTitle || test.title },
      ]),
    ]).values(),
  ];
  scope.handlePrint = async () => {
    scope.setExportBusy(true);
    try {
      printResults(await scope.collectAllFiltered());
    } catch (error) {
      scope.toast(error.message || "Chop etib bo'lmadi.", true);
    } finally {
      scope.setExportBusy(false);
    }
  };
  scope.refresh = () => Promise.all([scope.loadResults(), scope.loadMetadata()]);
  return { done: true, value: view14(scope) };
}
