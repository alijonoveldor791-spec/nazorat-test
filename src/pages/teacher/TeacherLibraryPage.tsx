import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Archive,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit3,
  FileText,
  FileUp,
  Globe,
  KeyRound,
  Minus,
  Plus,
  RefreshCw,
  Search,
  Share2,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SafeContent } from '../../components/ui/SafeContent';
import { QuestionEditorList } from '../../components/teacher/QuestionEditorList';
import { useAdminSession } from '../../hooks/useAdminSession';
import { useToast } from '../../context/ToastContext';
import { ApiError, adminApi, adminPost, getToken } from '../../lib/api';
import { copyToClipboard, downloadBlob, formatDateTime } from '../../lib/format';
import type {
  BankAccess,
  QuarterDraft,
  Question,
  SchoolClass,
  SharedTest,
  Topic,
  TestItem,
} from '../../types/api';

const LETTERS = 'ABCDEF';

function buildSuggestedTitle(chosen: Topic[]): string {
  if (!chosen.length) return '';
  const quarters = Array.from(new Set(chosen.map((t) => `${t.quarter}-chorak`))).join(', ');
  return `${chosen[0].grade}-sinf ${chosen[0].subject} (${quarters})`;
}

export function TeacherLibraryPage() {
  const { session, loading: sessionLoading } = useAdminSession('teacher');
  const { toast } = useToast();

  const [topics, setTopics] = useState<Topic[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [sharedTests, setSharedTests] = useState<SharedTest[]>([]);
  const [bankAccess, setBankAccess] = useState<BankAccess>({ permissions: {} });
  const [loading, setLoading] = useState(true);

  const [gradeFilter, setGradeFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [quarterFilter, setQuarterFilter] = useState('');
  const [topicQuery, setTopicQuery] = useState('');

  const [selectedTopicIds, setSelectedTopicIds] = useState<Set<string>>(new Set());
  const [amounts, setAmounts] = useState<Record<string, number>>({});
  const [draftTitle, setDraftTitle] = useState('');
  const [lastSuggested, setLastSuggested] = useState('');

  const [testQuery, setTestQuery] = useState('');
  const [testStatusTab, setTestStatusTab] = useState<0 | 1 | 2>(0);
  const [testPage, setTestPage] = useState(1);
  const [testPageSize, setTestPageSize] = useState(4);
  const [bankQuery, setBankQuery] = useState('');

  // New topic modal
  const [newTopicOpen, setNewTopicOpen] = useState(false);
  const [ntGrade, setNtGrade] = useState('');
  const [ntSubject, setNtSubject] = useState('');
  const [ntQuarter, setNtQuarter] = useState(1);
  const [ntName, setNtName] = useState('');

  // Prompt modal
  const [promptTopic, setPromptTopic] = useState<Topic | null>(null);
  const [promptCount, setPromptCount] = useState(20);
  const [promptLevel, setPromptLevel] = useState("O'rtacha");
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // Inspect topic modal
  const [inspectTopicData, setInspectTopicData] = useState<Topic | null>(null);
  const [inspectSearch, setInspectSearch] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Import into topic modal
  const [importTopicData, setImportTopicData] = useState<Topic | null>(null);
  const [importQuestions, setImportQuestions] = useState<Question[]>([]);
  const [importSelected, setImportSelected] = useState<Set<number>>(new Set());
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importBusy, setImportBusy] = useState(false);
  const [importError, setImportError] = useState('');

  // Draft review modal
  const [draft, setDraft] = useState<QuarterDraft | null>(null);
  const [draftReviewTitle, setDraftReviewTitle] = useState('');
  const [draftBusy, setDraftBusy] = useState(false);

  // Publish modal
  const [publishTestId, setPublishTestId] = useState<string | null>(null);
  const [pubClassId, setPubClassId] = useState('');
  const [pubTime, setPubTime] = useState(30);
  const [pubAttempts, setPubAttempts] = useState(1);
  const [pubShuffleQ, setPubShuffleQ] = useState(false);
  const [pubShuffleO, setPubShuffleO] = useState(false);
  const [publishedCode, setPublishedCode] = useState<string | null>(null);

  // Delete saved test confirm
  const [deleteTestId, setDeleteTestId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [tpc, tst, cls, acc] = await Promise.all([
        adminApi<Topic[]>('topics'),
        adminApi<TestItem[]>('tests'),
        adminApi<SchoolClass[]>('classes'),
        adminApi<BankAccess>('bank-access'),
      ]);
      setTopics(tpc);
      setTests(tst);
      setClasses(cls);
      setBankAccess(acc);
      if (acc.permissions?.view) {
        const sh = await adminApi<SharedTest[]>('shared-tests');
        setSharedTests(sh);
      } else {
        setSharedTests([]);
      }
      setSelectedTopicIds((prev) => {
        const next = new Set<string>();
        for (const id of prev) {
          if (tpc.some((t) => t.id === id)) next.add(id);
        }
        return next;
      });
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi.", true);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!sessionLoading && session) {
      loadData();
    }
  }, [sessionLoading, session, loadData]);

  const visibleTopics = useMemo(() => {
    const g = gradeFilter.toLowerCase().trim();
    const s = subjectFilter.toLowerCase().trim();
    const q = topicQuery.toLowerCase().trim();
    return topics.filter(
      (t) =>
        (!g || t.grade.toLowerCase() === g) &&
        (!s || t.subject.toLowerCase().includes(s)) &&
        (!quarterFilter || t.quarter === Number(quarterFilter)) &&
        t.name.toLowerCase().includes(q)
    );
  }, [topics, gradeFilter, subjectFilter, quarterFilter, topicQuery]);

  const chosenTopics = useMemo(
    () => topics.filter((t) => selectedTopicIds.has(t.id)),
    [topics, selectedTopicIds]
  );

  useEffect(() => {
    const nextSug = buildSuggestedTitle(chosenTopics);
    if (!draftTitle || draftTitle === lastSuggested) {
      setDraftTitle(nextSug);
    }
    setLastSuggested(nextSug);
  }, [chosenTopics, draftTitle, lastSuggested]);

  const totalSelectedQuestions = useMemo(
    () => chosenTopics.reduce((sum, t) => sum + (amounts[t.id] ?? 1), 0),
    [chosenTopics, amounts]
  );

  const selectionValid = useMemo(() => {
    if (!chosenTopics.length || totalSelectedQuestions > 200) return false;
    return chosenTopics.every((t) => {
      const val = amounts[t.id] ?? 1;
      return Number.isInteger(val) && val >= 1 && val <= t.count;
    });
  }, [chosenTopics, amounts, totalSelectedQuestions]);

  const filteredSavedTests = useMemo(() => {
    const q = testQuery.toLowerCase().trim();
    return tests.filter(
      (t) =>
        `${t.title} ${t.testCode?.value || ''}`.toLowerCase().includes(q) &&
        (!testStatusTab || (testStatusTab === 2 ? Boolean(t.active) : !t.active))
    );
  }, [tests, testQuery, testStatusTab]);

  const savedPages = Math.max(1, Math.ceil(filteredSavedTests.length / testPageSize));
  const currentSavedPage = Math.min(testPage, savedPages);
  const pagedSavedTests = filteredSavedTests.slice(
    (currentSavedPage - 1) * testPageSize,
    currentSavedPage * testPageSize
  );

  const handleSelectTopic = (topic: Topic) => {
    const first = chosenTopics[0];
    if (first && (first.grade !== topic.grade || first.subject !== topic.subject)) {
      toast("Bir sinf va fan mavzularini tanlang; choraklar turlicha bo'lishi mumkin.", true);
      return;
    }
    setSelectedTopicIds((prev) => new Set(prev).add(topic.id));
    setAmounts((prev) => ({ ...prev, [topic.id]: Math.min(10, topic.count) }));
  };

  const handleUnselectTopic = (id: string) => {
    setSelectedTopicIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await adminPost('topics', {
        grade: ntGrade.trim(),
        subject: ntSubject.trim(),
        quarter: ntQuarter,
        name: ntName.trim(),
      });
      setNewTopicOpen(false);
      setNtGrade('');
      setNtSubject('');
      setNtName('');
      toast('Mavzu yaratildi.');
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Mavzu yaratib bo'lmadi.", true);
    }
  };

  const handleGeneratePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptTopic) return;
    const text = `${promptTopic.grade}-sinf, ${promptTopic.subject} fani, ${promptTopic.quarter}-chorak, "${promptTopic.name}" mavzusi bo'yicha ${promptCount} ta ${promptLevel.toLowerCase()} darajadagi savoldan iborat, yuklashga tayyor DOCX fayl yarating.
Savollarni 1 dan ketma-ket raqamlang. Har savolda A., B., C., D. variantlari alohida qatorda yozilsin. Aynan bitta to'g'ri variant boshiga # qo'ying, masalan #B. Noto'g'ri variantlarda # bo'lmasin. Alohida javoblar kaliti yoki kirish matni qo'shmang. Formulalar Word formulasi sifatida, rasmlar va jadvallar savol ichida saqlansin. O'qituvchi tekshirganidan keyin fayl import qilinadi.`;
    setGeneratedPrompt(text);
  };

  const openInspectTopic = async (id: string) => {
    try {
      const full = await adminApi<Topic>(`topics/${encodeURIComponent(id)}`);
      setInspectTopicData(full);
      setInspectSearch('');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Mavzu savollarini yuklab bo'lmadi.", true);
    }
  };

  const handleToggleArchiveQuestion = async (q: Question) => {
    if (!inspectTopicData || !q.id) return;
    try {
      const updated = await adminPost<Topic>(
        `topics/${inspectTopicData.id}/question`,
        { questionId: q.id, version: inspectTopicData.version, archived: !q.archived },
        'PUT'
      );
      setInspectTopicData(updated);
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "O'zgartirib bo'lmadi.", true);
    }
  };

  const handleSaveEditedTopicQuestion = async () => {
    if (!inspectTopicData || !editingQuestion?.id) return;
    try {
      const updated = await adminPost<Topic>(
        `topics/${inspectTopicData.id}/question`,
        {
          questionId: editingQuestion.id,
          version: inspectTopicData.version,
          question: editingQuestion,
          archived: editingQuestion.archived,
        },
        'PUT'
      );
      setInspectTopicData(updated);
      setEditingQuestion(null);
      toast('Savol yangilandi.');
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    }
  };

  const openImportModal = async (topic: Topic) => {
    try {
      const full = await adminApi<Topic>(`topics/${encodeURIComponent(topic.id)}`);
      setImportTopicData(full);
      setImportQuestions([]);
      setImportSelected(new Set());
      setImportFile(null);
      setImportError('');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Mavzuni ochib bo'lmadi.", true);
    }
  };

  const handlePreviewImportWord = async () => {
    setImportError('');
    if (!importFile) {
      setImportError('Avval .doc yoki .docx Word faylini tanlang.');
      return;
    }
    setImportBusy(true);
    try {
      const form = new FormData();
      form.append('file', importFile, importFile.name);
      const res = await adminApi<{ questions: Question[]; warnings?: { message: string }[] }>(
        'tests/preview',
        { method: 'POST', body: form }
      );
      setImportQuestions(res.questions);
      setImportSelected(new Set(res.questions.map((_, i) => i)));
      if (res.warnings?.length) {
        setImportError(res.warnings.map((w) => w.message).join(' '));
      }
      toast(`${res.questions.length} ta savol tahlil qilindi.`);
    } catch (err) {
      setImportError(err instanceof Error ? err.message : "Tahlil qilib bo'lmadi.");
    } finally {
      setImportBusy(false);
    }
  };

  const handleCommitImport = async () => {
    if (!importTopicData) return;
    const chosen = importQuestions.filter((_, i) => importSelected.has(i));
    if (!chosen.length) {
      toast('Kamida bitta savol kiriting yoki tanlang.', true);
      return;
    }
    try {
      await adminPost(`topics/${importTopicData.id}/import`, {
        version: importTopicData.version,
        questions: chosen,
      });
      setImportTopicData(null);
      toast(`${chosen.length} ta savol bazaga qo'shildi.`);
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Import qilib bo'lmadi.", true);
    }
  };

  const handleComposeDraft = async () => {
    if (!selectionValid) return;
    setDraftBusy(true);
    try {
      const composed = await adminPost<QuarterDraft>('quarter/compose', {
        topics: chosenTopics.map((t) => ({ id: t.id, count: amounts[t.id] || 1 })),
      });
      setDraft(composed);
      setDraftReviewTitle(draftTitle.trim() || composed.title);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Qoralama tuzib bo'lmadi.", true);
    } finally {
      setDraftBusy(false);
    }
  };

  const handleRegenerateDraft = async () => {
    if (!draft) return;
    setDraftBusy(true);
    try {
      const composed = await adminPost<QuarterDraft>('quarter/compose', { topics: draft.topics });
      setDraft(composed);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Qayta tuzib bo'lmadi.", true);
    } finally {
      setDraftBusy(false);
    }
  };

  const handleReplaceDraftQuestion = async (index: number) => {
    if (!draft) return;
    setDraftBusy(true);
    try {
      const rep = await adminPost<{ question: Question; source: { topicId: string; questionId: string } }>(
        'quarter/replace',
        {
          topicId: draft.sources[index].topicId,
          excluded: draft.sources.map((s) => s.questionId),
        }
      );
      if (
        draft.questions.some(
          (q) =>
            q.q === rep.question.q && JSON.stringify(q.options) === JSON.stringify(rep.question.options)
        )
      ) {
        throw new Error('Bu savol testda bor. Boshqa savol tanlash uchun qayta urining.');
      }
      setDraft((prev) =>
        prev
          ? {
              ...prev,
              questions: prev.questions.map((q, idx) => (idx === index ? rep.question : q)),
              sources: prev.sources.map((s, idx) => (idx === index ? rep.source : s)),
            }
          : null
      );
    } catch (err) {
      toast(err instanceof Error ? err.message : "Almashtirib bo'lmadi.", true);
    } finally {
      setDraftBusy(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    setDraftBusy(true);
    try {
      await adminPost('quarter/save', {
        title: draftReviewTitle.trim() || draft.title,
        subject: draft.subject,
        questions: draft.questions,
        topics: draft.topics,
        sources: draft.sources,
      });
      setDraft(null);
      toast('Test qoralamasi saqlab olindi.');
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      setDraftBusy(false);
    }
  };

  const handleDownloadDocument = async (id: string, format: 'docx' | 'pdf' | 'key', shared = false) => {
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
      toast(err instanceof Error ? err.message : "Yuklab bo'lmadi.", true);
    }
  };

  const handlePublishOnline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publishTestId || !pubClassId) {
      toast('Sinf yoki guruhni tanlang.', true);
      return;
    }
    try {
      const cls = classes.find((c) => c.id === pubClassId);
      const res = await adminPost<{ testCode: { value: string } }>(`tests/${publishTestId}/publish`, {
        classIds: [pubClassId],
        direction: cls?.direction || '',
        settings: {
          timeLimitMin: pubTime,
          maxAttempts: pubAttempts,
          shuffleQuestions: pubShuffleQ,
          shuffleOptions: pubShuffleO,
        },
      });
      setPublishTestId(null);
      setPublishedCode(res.testCode?.value || null);
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Onlayn berishda xato yuz berdi.", true);
    }
  };

  const handleDeleteSavedTest = async () => {
    if (!deleteTestId) return;
    try {
      await adminApi(`tests/${encodeURIComponent(deleteTestId)}`, { method: 'DELETE' });
      setDeleteTestId(null);
      toast("Test o'chirildi.");
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "O'chirib bo'lmadi.", true);
    }
  };

  const totalBankQuestions = useMemo(() => topics.reduce((sum, t) => sum + t.count, 0), [topics]);

  return (
    <AdminShell
      session={session}
      title="Savollar bazasi"
      subtitle="Maktab mavzulari, chorak test qoralamalari va umumiy tayyor bank."
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={loadData}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Yangilash</span>
          </button>
          <button
            type="button"
            onClick={() => setNewTopicOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 whitespace-nowrap"
          >
            <Plus className="h-4 w-4" />
            <span>Yangi mavzu</span>
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Jami baza</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {totalBankQuestions} savol
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Saqlangan testlar</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {tests.length} ta
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Faol testlar</p>
            <p className="mt-1 font-display text-2xl font-bold tabular-nums text-slate-900 dark:text-white">
              {tests.filter((t) => t.active).length} ta
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <section className="space-y-4 lg:col-span-7">
            <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:grid-cols-4 dark:border-slate-800 dark:bg-slate-900">
              <input
                type="text"
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                placeholder="Sinf (mas: 7)"
                aria-label="Sinf filtri"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <input
                type="text"
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                placeholder="Fan..."
                aria-label="Fan filtri"
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <select
                value={quarterFilter}
                onChange={(e) => setQuarterFilter(e.target.value)}
                aria-label="Chorak filtri"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              >
                <option value="">Barcha choraklar</option>
                {[1, 2, 3, 4].map((q) => (
                  <option key={q} value={q}>
                    {q}-chorak
                  </option>
                ))}
              </select>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={topicQuery}
                  onChange={(e) => setTopicQuery(e.target.value)}
                  placeholder="Mavzu..."
                  aria-label="Mavzu qidirish"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium uppercase tracking-wider">Mavzular</span>
              <span className="tabular-nums">{visibleTopics.length} ta mavzu</span>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
                ))}
              </div>
            ) : visibleTopics.length === 0 ? (
              <EmptyState
                title="Mavzu topilmadi"
                description="Yangi mavzu yarating yoki filtrlarni tozalang."
              />
            ) : (
              <div className="space-y-3">
                {visibleTopics.map((topic, idx) => {
                  const chosen = selectedTopicIds.has(topic.id);
                  return (
                    <article
                      key={topic.id}
                      className={`rounded-2xl border p-4 transition-colors ${
                        chosen
                          ? 'border-blue-500 bg-blue-50/40 dark:border-blue-500 dark:bg-blue-950/20'
                          : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span className="font-mono font-semibold">{String(idx + 1).padStart(2, '0')}.</span>
                            <span>
                              {topic.grade}-sinf · {topic.subject} · {topic.quarter}-chorak
                            </span>
                          </div>
                          <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                            {topic.name}
                          </h3>
                          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                            <strong className="text-slate-800 dark:text-slate-200">{topic.count} savol</strong>
                            {topic.lastUploadedAt ? ` · Yuklangan: ${formatDateTime(topic.lastUploadedAt)}` : ''}
                          </p>
                        </div>

                        <button
                          type="button"
                          onClick={() => openInspectTopic(topic.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <span>Savollar</span>
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
                        <button
                          type="button"
                          disabled={chosen || !topic.count}
                          onClick={() => handleSelectTopic(topic)}
                          className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold whitespace-nowrap ${
                            chosen
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 dark:bg-white dark:text-slate-900'
                          }`}
                        >
                          {chosen ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          <span>{chosen ? 'Tanlangan' : 'Tanlash'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => openImportModal(topic)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <FileUp className="h-3.5 w-3.5" />
                          <span>Word qo'shish</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPromptTopic(topic);
                            setGeneratedPrompt('');
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Prompt tayyorlash</span>
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <aside className="lg:col-span-5">
            <div className="sticky top-20 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
                <div>
                  <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                    Tanlangan mavzular
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {chosenTopics.length} ta mavzu tanlandi
                  </p>
                </div>
                <strong className="font-display text-lg font-bold tabular-nums text-blue-600 dark:text-blue-400">
                  {totalSelectedQuestions} savol
                </strong>
              </div>

              <label className="block space-y-1.5">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Test nomi</span>
                <input
                  type="text"
                  maxLength={100}
                  value={draftTitle}
                  onChange={(e) => setDraftTitle(e.target.value)}
                  placeholder="Test nomini kiriting"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              {chosenTopics.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  Test tuzish uchun chap tarafdan mavzu tanlang.
                </p>
              ) : (
                <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                  {chosenTopics.map((t) => {
                    const amt = amounts[t.id] ?? 1;
                    return (
                      <div
                        key={t.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2 dark:border-slate-800 dark:bg-slate-950/60"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-slate-900 truncate dark:text-white">
                              {t.name}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {t.quarter}-chorak · Mavjud: {t.count} savol
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUnselectTopic(t.id)}
                            className="text-xs font-medium text-red-600 hover:underline shrink-0 dark:text-red-400"
                          >
                            Olish
                          </button>
                        </div>

                        <div className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-slate-600 dark:text-slate-300">Savollar soni:</span>
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setAmounts((prev) => ({
                                  ...prev,
                                  [t.id]: Math.max(1, (prev[t.id] ?? 1) - 1),
                                }))
                              }
                              className="rounded-lg border border-slate-200 bg-white p-1 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
                              aria-label="Kamaytirish"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={Math.min(200, t.count)}
                              value={amt}
                              onChange={(e) =>
                                setAmounts((prev) => ({ ...prev, [t.id]: Number(e.target.value) }))
                              }
                              aria-label={`${t.name}: savollar soni`}
                              className="w-16 rounded-lg border border-slate-300 bg-white px-2 py-1 text-center text-xs font-semibold tabular-nums dark:border-slate-700 dark:bg-slate-900"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setAmounts((prev) => ({
                                  ...prev,
                                  [t.id]: Math.min(t.count, 200, (prev[t.id] ?? 1) + 1),
                                }))
                              }
                              className="rounded-lg border border-slate-200 bg-white p-1 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900"
                              aria-label="Oshirish"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {totalSelectedQuestions > 200 && (
                <p role="alert" className="text-xs font-medium text-red-600 dark:text-red-400">
                  Jami 200 savoldan oshmasin.
                </p>
              )}

              <button
                type="button"
                disabled={!selectionValid || draftBusy}
                onClick={handleComposeDraft}
                className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                {draftBusy ? 'Tuzilmoqda...' : 'Test qoralamasini tuzish'}
              </button>
            </div>
          </aside>
        </div>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
              Saqlangan testlar ({filteredSavedTests.length})
            </h2>
            <div className="flex flex-wrap items-center gap-2.5">
              <input
                type="search"
                value={testQuery}
                onChange={(e) => {
                  setTestQuery(e.target.value);
                  setTestPage(1);
                }}
                placeholder="Test nomi yoki kodi..."
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
              <div className="inline-flex rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-950">
                {(['Barchasi', 'Qoralama', 'Faol'] as const).map((label, idx) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => {
                      setTestStatusTab(idx as 0 | 1 | 2);
                      setTestPage(1);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
                      testStatusTab === idx
                        ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-800 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {pagedSavedTests.length === 0 ? (
            <EmptyState
              title="Saqlangan test topilmadi"
              description="Mavzulardan test qoralamasini tuzing yoki qidiruvni o'zgartiring."
            />
          ) : (
            <div className="space-y-3">
              {pagedSavedTests.map((t, i) => {
                const own = t.origin?.type !== 'shared';
                const perms = bankAccess.permissions || {};
                const qCount = t.count ?? t.questionCount ?? t.questions?.length ?? 0;
                return (
                  <article
                    key={t.id}
                    className="rounded-xl border border-slate-200 p-4 space-y-3 dark:border-slate-800"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-mono text-slate-400">
                            {String((currentSavedPage - 1) * testPageSize + i + 1).padStart(2, '0')}.
                          </span>
                          <span
                            className={`font-semibold ${
                              t.active ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                            }`}
                          >
                            {t.active ? 'Faol' : 'Qoralama'}
                          </span>
                          {t.testCode?.value && (
                            <span className="font-mono text-slate-700 dark:text-slate-200">
                              · Kod: {t.testCode.value}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 font-display text-base font-bold text-slate-900 dark:text-white">
                          {t.title}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {qCount} savol ·{' '}
                          {t.libraryQuarters?.length ? `${t.libraryQuarters.join(', ')}-chorak · ` : ''}
                          {t.composition?.topics?.map((v) => `${v.name} (${v.count})`).join(', ') ||
                            (own ? 'Maktab testi' : 'Umumiy bank nusxasi')}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        disabled={!own && !(perms.take || perms.rerunExpired)}
                        onClick={() => {
                          setPublishTestId(t.id);
                          setPubClassId(classes[0]?.id || '');
                        }}
                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40 whitespace-nowrap"
                      >
                        <Globe className="h-3.5 w-3.5" />
                        <span>Onlayn berish</span>
                      </button>
                      <button
                        type="button"
                        disabled={!own && !perms.docx}
                        onClick={() => handleDownloadDocument(t.id, 'docx')}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        <span>Word</span>
                      </button>
                      <button
                        type="button"
                        disabled={!own && !perms.pdf}
                        onClick={() => handleDownloadDocument(t.id, 'pdf')}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>PDF</span>
                      </button>
                      <button
                        type="button"
                        disabled={!own && !perms.key}
                        onClick={() => handleDownloadDocument(t.id, 'key')}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        <KeyRound className="h-3.5 w-3.5" />
                        <span>Javoblar kaliti</span>
                      </button>
                      {own && (
                        <button
                          type="button"
                          onClick={async () => {
                            try {
                              await adminPost(`tests/${t.id}/share`);
                              toast("Ko'rib chiqishga yuborildi.");
                            } catch (err) {
                              toast(err instanceof ApiError ? err.message : "Ulashib bo'lmadi.", true);
                            }
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          <Share2 className="h-3.5 w-3.5" />
                          <span>Ulashish</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setDeleteTestId(t.id)}
                        className="ml-auto inline-flex items-center gap-1 rounded-lg border border-transparent px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>O'chirish</span>
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {filteredSavedTests.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs text-slate-600 dark:text-slate-400">
              <span className="tabular-nums">
                Sahifa {currentSavedPage} / {savedPages} · Jami {filteredSavedTests.length} ta
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={testPageSize}
                  onChange={(e) => {
                    setTestPageSize(Number(e.target.value));
                    setTestPage(1);
                  }}
                  aria-label="Sahifa hajmi"
                  className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value={4}>4 ta</option>
                  <option value={8}>8 ta</option>
                  <option value={20}>20 ta</option>
                </select>
                <button
                  type="button"
                  disabled={currentSavedPage <= 1}
                  onClick={() => setTestPage((p) => Math.max(1, p - 1))}
                  className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 dark:border-slate-700"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  disabled={currentSavedPage >= savedPages}
                  onClick={() => setTestPage((p) => Math.min(savedPages, p + 1))}
                  className="rounded-lg border border-slate-200 p-1.5 disabled:opacity-40 dark:border-slate-700"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                Umumiy tayyor test banki
              </h2>
            </div>
            {bankAccess.permissions?.view && (
              <input
                type="search"
                value={bankQuery}
                onChange={(e) => setBankQuery(e.target.value)}
                placeholder="Umumiy testlardan qidirish..."
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            )}
          </div>

          {!bankAccess.permissions?.view ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Joriy tarifingizda umumiy bank yopiq.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {sharedTests
                .filter((st) =>
                  `${st.title} ${st.subject}`.toLowerCase().includes(bankQuery.toLowerCase())
                )
                .map((st) => (
                  <article
                    key={st.id}
                    className="rounded-xl border border-slate-200 p-4 space-y-3 dark:border-slate-800"
                  >
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{st.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {st.subject} · {st.count ?? st.questions?.length ?? 0} savol
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={!bankAccess.permissions?.take}
                        onClick={async () => {
                          try {
                            await adminPost(`shared-tests/${st.id}/take`);
                            toast("Test maktab ro'yxatiga olindi.");
                            await loadData();
                          } catch (err) {
                            toast(err instanceof ApiError ? err.message : "Olib bo'lmadi.", true);
                          }
                        }}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-40"
                      >
                        Testni olish
                      </button>
                      <button
                        type="button"
                        disabled={!bankAccess.permissions?.docx}
                        onClick={() => handleDownloadDocument(st.id, 'docx', true)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
                      >
                        Word
                      </button>
                      <button
                        type="button"
                        disabled={!bankAccess.permissions?.pdf}
                        onClick={() => handleDownloadDocument(st.id, 'pdf', true)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
                      >
                        PDF
                      </button>
                      <button
                        type="button"
                        disabled={!bankAccess.permissions?.key}
                        onClick={() => handleDownloadDocument(st.id, 'key', true)}
                        className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-200"
                      >
                        Javoblar kaliti
                      </button>
                    </div>
                  </article>
                ))}
            </div>
          )}
        </section>
      </div>

      {/* New topic modal */}
      <Modal
        open={newTopicOpen}
        onClose={() => setNewTopicOpen(false)}
        title="Yangi mavzu"
        footer={
          <>
            <button
              type="button"
              onClick={() => setNewTopicOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              form="new-topic-form"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Yaratish
            </button>
          </>
        }
      >
        <form id="new-topic-form" onSubmit={handleCreateTopic} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Sinf</span>
            <input
              type="text"
              required
              maxLength={60}
              value={ntGrade}
              onChange={(e) => setNtGrade(e.target.value)}
              placeholder="7"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fan</span>
            <input
              type="text"
              required
              maxLength={100}
              value={ntSubject}
              onChange={(e) => setNtSubject(e.target.value)}
              placeholder="Algebra"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Chorak</span>
            <select
              value={ntQuarter}
              onChange={(e) => setNtQuarter(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {[1, 2, 3, 4].map((q) => (
                <option key={q} value={q}>
                  {q}-chorak
                </option>
              ))}
            </select>
          </label>
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Mavzu nomi</span>
            <input
              type="text"
              required
              maxLength={160}
              value={ntName}
              onChange={(e) => setNtName(e.target.value)}
              placeholder="Kvadrat tenglamalar"
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </label>
        </form>
      </Modal>

      {/* AI Prompt modal */}
      <Modal
        open={Boolean(promptTopic)}
        onClose={() => setPromptTopic(null)}
        title="AI Prompt tayyorlash"
      >
        {promptTopic && (
          <div className="space-y-4">
            <form onSubmit={handleGeneratePrompt} className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Savollar soni</span>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={promptCount}
                  onChange={(e) => setPromptCount(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Qiyinlik</span>
                <select
                  value={promptLevel}
                  onChange={(e) => setPromptLevel(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="Oson">Oson</option>
                  <option value="O'rtacha">O'rtacha</option>
                  <option value="Qiyin">Qiyin</option>
                </select>
              </label>
              <button
                type="submit"
                className="sm:col-span-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Promptni yaratish
              </button>
            </form>

            {generatedPrompt && (
              <div className="space-y-2">
                <textarea
                  rows={8}
                  readOnly
                  value={generatedPrompt}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200"
                />
                <button
                  type="button"
                  onClick={async () => {
                    const ok = await copyToClipboard(generatedPrompt);
                    toast(ok ? 'Prompt nusxalandi.' : 'Nusxalanmadi.', !ok);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>Nusxalash</span>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Inspect topic modal */}
      <Modal
        open={Boolean(inspectTopicData)}
        onClose={() => {
          setInspectTopicData(null);
          setEditingQuestion(null);
        }}
        title={inspectTopicData ? inspectTopicData.name : ''}
        size="lg"
      >
        {inspectTopicData && !editingQuestion && (
          <div className="space-y-4">
            <input
              type="search"
              value={inspectSearch}
              onChange={(e) => setInspectSearch(e.target.value)}
              placeholder="Savol matnidan qidirish..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
            <div className="space-y-3">
              {(inspectTopicData.questions || [])
                .filter((q) => q.q.toLowerCase().includes(inspectSearch.toLowerCase()))
                .map((q) => (
                  <div
                    key={q.id}
                    className="rounded-xl border border-slate-200 p-4 text-sm space-y-2 dark:border-slate-800"
                  >
                    <div className="text-slate-900 dark:text-white">
                      <SafeContent content={q.q} format={q.contentFormat} />
                    </div>
                    <div className="flex items-center justify-between pt-2 text-xs">
                      <span className={q.archived ? 'text-amber-600' : 'text-emerald-600'}>
                        {q.archived ? 'Arxivlangan' : 'Faol'}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setEditingQuestion(structuredClone(q))}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>Tahrirlash</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleArchiveQuestion(q)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                        >
                          <Archive className="h-3 w-3" />
                          <span>{q.archived ? 'Tiklash' : 'Arxivlash'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {editingQuestion && (
          <div className="space-y-4">
            <QuestionEditorList
              questions={[editingQuestion]}
              allowAdd={false}
              onChange={(next) => setEditingQuestion(next[0] || null)}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingQuestion(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700"
              >
                Orqaga
              </button>
              <button
                type="button"
                onClick={handleSaveEditedTopicQuestion}
                className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Saqlash
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Import into topic modal */}
      <Modal
        open={Boolean(importTopicData)}
        onClose={() => setImportTopicData(null)}
        title="Mavzuga savollar qo'shish"
        size="xl"
        footer={
          <>
            <button
              type="button"
              onClick={() => setImportTopicData(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleCommitImport}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Tanlanganlarni bazaga qo'shish ({importSelected.size})
            </button>
          </>
        }
      >
        {importTopicData && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {importTopicData.name} · {importTopicData.quarter}-chorak
            </p>
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
              <input
                type="file"
                accept=".doc,.docx"
                onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                className="text-xs"
              />
              <button
                type="button"
                disabled={importBusy}
                onClick={handlePreviewImportWord}
                className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              >
                {importBusy ? 'Tahlil...' : 'Word faylni tahlil qilish'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const idx = importQuestions.length;
                  setImportQuestions((prev) => [...prev, { q: '', options: ['', ''], answer: 0 }]);
                  setImportSelected((prev) => new Set(prev).add(idx));
                }}
                className="ml-auto rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium dark:border-slate-700 dark:bg-slate-900"
              >
                + Savol
              </button>
            </div>
            {importError && <p className="text-xs text-amber-700 dark:text-amber-300">{importError}</p>}

            <QuestionEditorList
              questions={importQuestions}
              onChange={(next) => setImportQuestions(next)}
              selectionSet={importSelected}
              onToggleSelect={(idx) =>
                setImportSelected((prev) => {
                  const next = new Set(prev);
                  if (next.has(idx)) next.delete(idx);
                  else next.add(idx);
                  return next;
                })
              }
            />
          </div>
        )}
      </Modal>

      {/* Draft review modal */}
      <Modal
        open={Boolean(draft)}
        onClose={() => setDraft(null)}
        title="Test qoralamasi"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setDraft(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={draftBusy}
              onClick={handleSaveDraft}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              Qoralamani saqlash
            </button>
          </>
        }
      >
        {draft && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-end gap-3">
              <label className="flex-1 space-y-1">
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">Test nomi</span>
                <input
                  type="text"
                  maxLength={100}
                  value={draftReviewTitle}
                  onChange={(e) => setDraftReviewTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <button
                type="button"
                disabled={draftBusy}
                onClick={handleRegenerateDraft}
                className="rounded-xl border border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
              >
                Testni qayta tuzish
              </button>
            </div>

            <div className="space-y-3">
              {draft.questions.map((q, i) => (
                <article
                  key={i}
                  className="rounded-xl border border-slate-200 p-4 text-sm space-y-2 dark:border-slate-800"
                >
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {i + 1}. <SafeContent content={q.q} format={q.contentFormat} inline />
                  </div>
                  <div className="space-y-1 text-xs text-slate-700 dark:text-slate-300">
                    {q.options.map((opt, j) => (
                      <p key={j} className={q.answer === j ? 'font-semibold text-emerald-700 dark:text-emerald-400' : ''}>
                        {q.answer === j ? "To'g'ri: " : ''}
                        {LETTERS[j]}. <SafeContent content={opt} format={q.contentFormat} inline />
                      </p>
                    ))}
                  </div>
                  <button
                    type="button"
                    disabled={draftBusy}
                    onClick={() => handleReplaceDraftQuestion(i)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    Shu mavzudan almashtirish
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Publish modal */}
      <Modal
        open={Boolean(publishTestId)}
        onClose={() => setPublishTestId(null)}
        title="Onlayn berish"
        footer={
          <>
            <button
              type="button"
              onClick={() => setPublishTestId(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              form="publish-online-form"
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Faollashtirish
            </button>
          </>
        }
      >
        <form id="publish-online-form" onSubmit={handlePublishOnline} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium">Sinf yoki guruh</span>
            <select
              value={pubClassId}
              onChange={(e) => setPubClassId(e.target.value)}
              required
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Vaqt (daqiqa)</span>
              <input
                type="number"
                min={0}
                max={240}
                value={pubTime}
                onChange={(e) => setPubTime(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Urinishlar</span>
              <input
                type="number"
                min={1}
                max={100}
                value={pubAttempts}
                onChange={(e) => setPubAttempts(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pubShuffleQ} onChange={(e) => setPubShuffleQ(e.target.checked)} />
            <span>Savollarni aralashtirish</span>
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={pubShuffleO} onChange={(e) => setPubShuffleO(e.target.checked)} />
            <span>Variantlarni aralashtirish</span>
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(publishedCode)}
        onClose={() => setPublishedCode(null)}
        title="Test kodi yaratildi"
      >
        {publishedCode && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-slate-600 dark:text-slate-300">
              O'quvchilar maktab IDsi va ushbu kod orqali kiradi:
            </p>
            <p className="font-mono text-3xl font-bold tracking-widest text-slate-900 dark:text-white">
              {publishedCode}
            </p>
            <button
              type="button"
              onClick={async () => {
                const ok = await copyToClipboard(publishedCode);
                toast(ok ? 'Kod nusxalandi.' : 'Nusxalanmadi.', !ok);
              }}
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Kodni nusxalash
            </button>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTestId)}
        onClose={() => setDeleteTestId(null)}
        onConfirm={handleDeleteSavedTest}
        title="Testni o'chirish"
        message="Test o'chiriladi. Davom etasizmi?"
        confirmLabel="O'chirish"
        danger
      />
    </AdminShell>
  );
}
