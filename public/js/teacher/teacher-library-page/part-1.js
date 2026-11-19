// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import { callback as useCallback, effect as useEffect, memo as useMemo } from '../../core/state.js';
import { ApiError, adminApi } from '../../core/api.js';
import { buildSuggestedTitle } from './shared.js';
export function part1(scope) {
  scope.loadData = useCallback(async () => {
    scope.setLoading(true);
    try {
      const [tpc, tst, cls, acc] = await Promise.all([
        adminApi('topics'),
        adminApi('tests'),
        adminApi('classes'),
        adminApi('bank-access'),
      ]);
      scope.setTopics(tpc);
      scope.setTests(tst);
      scope.setClasses(cls);
      scope.setBankAccess(acc);
      if (acc.permissions?.view) {
        const sh = await adminApi('shared-tests');
        scope.setSharedTests(sh);
      } else {
        scope.setSharedTests([]);
      }
      scope.setSelectedTopicIds((prev) => {
        const next = new Set();
        for (const id of prev) {
          if (tpc.some((t) => t.id === id)) next.add(id);
        }
        return next;
      });
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi.", true);
    } finally {
      scope.setLoading(false);
    }
  }, [scope.toast]);
  useEffect(() => {
    if (!scope.sessionLoading && scope.session) {
      scope.loadData();
    }
  }, [scope.sessionLoading, scope.session, scope.loadData]);
  scope.visibleTopics = useMemo(() => {
    const g = scope.gradeFilter.toLowerCase().trim();
    const s = scope.subjectFilter.toLowerCase().trim();
    const q = scope.topicQuery.toLowerCase().trim();
    return scope.topics.filter(
      (t) =>
        (!g || t.grade.toLowerCase() === g) &&
        (!s || t.subject.toLowerCase().includes(s)) &&
        (!scope.quarterFilter || t.quarter === Number(scope.quarterFilter)) &&
        t.name.toLowerCase().includes(q)
    );
  }, [scope.topics, scope.gradeFilter, scope.subjectFilter, scope.quarterFilter, scope.topicQuery]);
  scope.chosenTopics = useMemo(
    () => scope.topics.filter((t) => scope.selectedTopicIds.has(t.id)),
    [scope.topics, scope.selectedTopicIds]
  );
  useEffect(() => {
    const nextSug = buildSuggestedTitle(scope.chosenTopics);
    if (!scope.draftTitle || scope.draftTitle === scope.lastSuggested) {
      scope.setDraftTitle(nextSug);
    }
    scope.setLastSuggested(nextSug);
  }, [scope.chosenTopics, scope.draftTitle, scope.lastSuggested]);
  scope.totalSelectedQuestions = useMemo(
    () => scope.chosenTopics.reduce((sum, t) => sum + (scope.amounts[t.id] ?? 1), 0),
    [scope.chosenTopics, scope.amounts]
  );
  scope.selectionValid = useMemo(() => {
    if (!scope.chosenTopics.length || scope.totalSelectedQuestions > 200) return false;
    return scope.chosenTopics.every((t) => {
      const val = scope.amounts[t.id] ?? 1;
      return Number.isInteger(val) && val >= 1 && val <= t.count;
    });
  }, [scope.chosenTopics, scope.amounts, scope.totalSelectedQuestions]);
  scope.filteredSavedTests = useMemo(() => {
    const q = scope.testQuery.toLowerCase().trim();
    return scope.tests.filter(
      (t) =>
        `${t.title} ${t.testCode?.value || ''}`.toLowerCase().includes(q) &&
        (!scope.testStatusTab || (scope.testStatusTab === 2 ? Boolean(t.active) : !t.active))
    );
  }, [scope.tests, scope.testQuery, scope.testStatusTab]);
  scope.savedPages = Math.max(1, Math.ceil(scope.filteredSavedTests.length / scope.testPageSize));
  scope.currentSavedPage = Math.min(scope.testPage, scope.savedPages);
  scope.pagedSavedTests = scope.filteredSavedTests.slice(
    (scope.currentSavedPage - 1) * scope.testPageSize,
    scope.currentSavedPage * scope.testPageSize
  );
  scope.handleSelectTopic = (topic) => {
    const first = scope.chosenTopics[0];
    if (first && (first.grade !== topic.grade || first.subject !== topic.subject)) {
      scope.toast("Bir sinf va fan mavzularini tanlang; choraklar turlicha bo'lishi mumkin.", true);
      return;
    }
    scope.setSelectedTopicIds((prev) => new Set(prev).add(topic.id));
    scope.setAmounts((prev) => ({ ...prev, [topic.id]: Math.min(10, topic.count) }));
  };
  scope.handleUnselectTopic = (id) => {
    scope.setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };
}
