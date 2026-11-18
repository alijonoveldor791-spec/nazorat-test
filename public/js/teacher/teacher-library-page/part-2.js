// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { ApiError, adminApi, adminPost } from '../../core/api.js';
export function part2(scope) {
  scope.handleCreateTopic = async (e) => {
    e.preventDefault();
    try {
      await adminPost('topics', {
        grade: scope.ntGrade.trim(),
        subject: scope.ntSubject.trim(),
        quarter: scope.ntQuarter,
        name: scope.ntName.trim(),
      });
      scope.setNewTopicOpen(false);
      scope.setNtGrade('');
      scope.setNtSubject('');
      scope.setNtName('');
      scope.toast('Mavzu yaratildi.');
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Mavzu yaratib bo'lmadi.", true);
    }
  };
  scope.handleGeneratePrompt = (e) => {
    e.preventDefault();
    if (!scope.promptTopic) return;
    const text = `${scope.promptTopic.grade}-sinf, ${scope.promptTopic.subject} fani, ${scope.promptTopic.quarter}-chorak, "${scope.promptTopic.name}" mavzusi bo'yicha ${scope.promptCount} ta ${scope.promptLevel.toLowerCase()} darajadagi savoldan iborat, yuklashga tayyor DOCX fayl yarating.
Savollarni 1 dan ketma-ket raqamlang. Har savolda A., B., C., D. variantlari alohida qatorda yozilsin. Aynan bitta to'g'ri variant boshiga # qo'ying, masalan #B. Noto'g'ri variantlarda # bo'lmasin. Alohida javoblar kaliti yoki kirish matni qo'shmang. Formulalar Word formulasi sifatida, rasmlar va jadvallar savol ichida saqlansin. O'qituvchi tekshirganidan keyin fayl import qilinadi.`;
    scope.setGeneratedPrompt(text);
  };
  scope.openInspectTopic = async (id) => {
    try {
      const full = await adminApi(`topics/${encodeURIComponent(id)}`);
      scope.setInspectTopicData(full);
      scope.setInspectSearch('');
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Mavzu savollarini yuklab bo'lmadi.", true);
    }
  };
  scope.handleToggleArchiveQuestion = async (q) => {
    if (!scope.inspectTopicData || !q.id) return;
    try {
      const updated = await adminPost(
        `topics/${scope.inspectTopicData.id}/question`,
        { questionId: q.id, version: scope.inspectTopicData.version, archived: !q.archived },
        'PUT'
      );
      scope.setInspectTopicData(updated);
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "O'zgartirib bo'lmadi.", true);
    }
  };
  scope.handleSaveEditedTopicQuestion = async () => {
    if (!scope.inspectTopicData || !scope.editingQuestion?.id) return;
    try {
      const updated = await adminPost(
        `topics/${scope.inspectTopicData.id}/question`,
        {
          questionId: scope.editingQuestion.id,
          version: scope.inspectTopicData.version,
          question: scope.editingQuestion,
          archived: scope.editingQuestion.archived,
        },
        'PUT'
      );
      scope.setInspectTopicData(updated);
      scope.setEditingQuestion(null);
      scope.toast('Savol yangilandi.');
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    }
  };
  scope.openImportModal = async (topic) => {
    try {
      const full = await adminApi(`topics/${encodeURIComponent(topic.id)}`);
      scope.setImportTopicData(full);
      scope.setImportQuestions([]);
      scope.setImportSelected(new Set());
      scope.setImportFile(null);
      scope.setImportError('');
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Mavzuni ochib bo'lmadi.", true);
    }
  };
  scope.handlePreviewImportWord = async () => {
    scope.setImportError('');
    if (!scope.importFile) {
      scope.setImportError('Avval .doc yoki .docx Word faylini tanlang.');
      return;
    }
    scope.setImportBusy(true);
    try {
      const form = new FormData();
      form.append('file', scope.importFile, scope.importFile.name);
      const res = await adminApi('tests/preview', { method: 'POST', body: form });
      scope.setImportQuestions(res.questions);
      scope.setImportSelected(new Set(res.questions.map((_, i) => i)));
      if (res.warnings?.length) {
        scope.setImportError(res.warnings.map((w) => w.message).join(' '));
      }
      scope.toast(`${res.questions.length} ta savol tahlil qilindi.`);
    } catch (err) {
      scope.setImportError(err instanceof Error ? err.message : "Tahlil qilib bo'lmadi.");
    } finally {
      scope.setImportBusy(false);
    }
  };
}
