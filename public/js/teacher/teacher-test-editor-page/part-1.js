// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { memo as useMemo } from '../../core/state.js';
import { adminApi } from '../../core/api.js';
export function part1(scope) {
  scope.visibleClasses = useMemo(() => {
    return scope.classes.filter((c) => {
      if (c.kind === 'group') return scope.forGroup && (!scope.direction || c.direction === scope.direction);
      return scope.forClass;
    });
  }, [scope.classes, scope.forClass, scope.forGroup, scope.direction]);
  scope.sectionsSummary = useMemo(() => {
    const map = new Map();
    for (const q of scope.questions) {
      if (!q.section) continue;
      const existing = map.get(q.section.id) || { ...q.section, count: 0 };
      existing.count += 1;
      map.set(q.section.id, existing);
    }
    return Array.from(map.values());
  }, [scope.questions]);
  scope.handleFileChange = (e) => {
    scope.setPreviewError('');
    const file = e.target.files?.[0] || null;
    if (!file) {
      scope.setSelectedFile(null);
      return;
    }
    if (!/\.(doc|docx)$/i.test(file.name)) {
      e.target.value = '';
      scope.setSelectedFile(null);
      scope.toast('DOC yoki DOCX Word hujjatini tanlang.', true);
      return;
    }
    if (file.size > 4000000) {
      scope.toast('Word fayli 4 MB dan oshmasin.', true);
      return;
    }
    scope.setSelectedFile(file);
  };
  scope.applyPreviewQuestions = (next) => {
    scope.setQuestions(next);
    if (next.some((q) => q.section)) {
      scope.setTestType('block');
      scope.setScoringMode('dtm');
    }
    scope.toast(`${next.length} savol tahlil qilindi. Pastda ko'rib chiqing va tahrirlang.`);
  };
  scope.handlePreview = async () => {
    scope.setPreviewError('');
    if (!scope.selectedFile) {
      scope.setPreviewError('Avval .doc yoki .docx Word faylini tanlang.');
      return;
    }
    scope.setPreviewBusy(true);
    try {
      const form = new FormData();
      form.append('file', scope.selectedFile, scope.selectedFile.name);
      const result = await adminApi('tests/preview', { method: 'POST', body: form });
      if (result.warnings?.length) {
        scope.setPreviewError(result.warnings.map((w) => w.message).join(' '));
      }
      if (scope.questions.length > 0) {
        scope.setReplacePreviewConfirm(result.questions);
      } else {
        scope.applyPreviewQuestions(result.questions);
      }
    } catch (err) {
      scope.setPreviewError(err instanceof Error ? err.message : "Faylni tahlil qilib bo'lmadi.");
    } finally {
      scope.setPreviewBusy(false);
    }
  };
  scope.activeSelectedIds = useMemo(
    () => Array.from(scope.selectedClassIds).filter((id) => scope.visibleClasses.some((c) => c.id === id)),
    [scope.selectedClassIds, scope.visibleClasses]
  );
  scope.handleOpenConfirm = (e) => {
    e.preventDefault();
    if (!scope.title.trim()) {
      scope.toast('Test nomini kiriting.', true);
      return;
    }
    if (!scope.activeSelectedIds.length) {
      scope.toast('Kamida bitta sinf yoki guruhni tanlang.', true);
      return;
    }
    if (!scope.questions.length) {
      scope.toast('Kamida bitta savol kiriting yoki Word faylni preview qiling.', true);
      return;
    }
    scope.setConfirmSaveOpen(true);
  };
}
