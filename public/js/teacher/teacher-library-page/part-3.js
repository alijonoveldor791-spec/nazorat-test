// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { ApiError, adminPost } from '../../core/api.js';
export function part3(scope) {
  scope.handleCommitImport = async () => {
    if (!scope.importTopicData) return;
    const chosen = scope.importQuestions.filter((_, i) => scope.importSelected.has(i));
    if (!chosen.length) {
      scope.toast('Kamida bitta savol kiriting yoki tanlang.', true);
      return;
    }
    try {
      await adminPost(`topics/${scope.importTopicData.id}/import`, {
        version: scope.importTopicData.version,
        questions: chosen,
      });
      scope.setImportTopicData(null);
      scope.toast(`${chosen.length} ta savol bazaga qo'shildi.`);
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Import qilib bo'lmadi.", true);
    }
  };
  scope.handleComposeDraft = async () => {
    if (!scope.selectionValid) return;
    scope.setDraftBusy(true);
    try {
      const composed = await adminPost('quarter/compose', {
        topics: scope.chosenTopics.map((t) => ({ id: t.id, count: scope.amounts[t.id] || 1 })),
      });
      scope.setDraft(composed);
      scope.setDraftReviewTitle(scope.draftTitle.trim() || composed.title);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Qoralama tuzib bo'lmadi.", true);
    } finally {
      scope.setDraftBusy(false);
    }
  };
  scope.handleRegenerateDraft = async () => {
    if (!scope.draft) return;
    scope.setDraftBusy(true);
    try {
      const composed = await adminPost('quarter/compose', { topics: scope.draft.topics });
      scope.setDraft(composed);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Qayta tuzib bo'lmadi.", true);
    } finally {
      scope.setDraftBusy(false);
    }
  };
  scope.handleReplaceDraftQuestion = async (index) => {
    if (!scope.draft) return;
    scope.setDraftBusy(true);
    try {
      const rep = await adminPost('quarter/replace', {
        topicId: scope.draft.sources[index].topicId,
        excluded: scope.draft.sources.map((s) => s.questionId),
      });
      if (
        scope.draft.questions.some(
          (q) => q.q === rep.question.q && JSON.stringify(q.options) === JSON.stringify(rep.question.options)
        )
      ) {
        throw new Error('Bu savol testda bor. Boshqa savol tanlash uchun qayta urining.');
      }
      scope.setDraft((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((q, idx) => (idx === index ? rep.question : q)),
              sources: prev.sources.map((s, idx) => (idx === index ? rep.source : s)),
            }
          : null
      );
    } catch (err) {
      scope.toast(err instanceof Error ? err.message : "Almashtirib bo'lmadi.", true);
    } finally {
      scope.setDraftBusy(false);
    }
  };
  scope.handleSaveDraft = async () => {
    if (!scope.draft) return;
    scope.setDraftBusy(true);
    try {
      await adminPost('quarter/save', {
        title: scope.draftReviewTitle.trim() || scope.draft.title,
        subject: scope.draft.subject,
        questions: scope.draft.questions,
        topics: scope.draft.topics,
        sources: scope.draft.sources,
      });
      scope.setDraft(null);
      scope.toast('Test qoralamasi saqlab olindi.');
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      scope.setDraftBusy(false);
    }
  };
}
