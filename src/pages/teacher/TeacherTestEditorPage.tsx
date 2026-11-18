import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, FileUp, Plus, Save } from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { QuestionEditorList } from '../../components/teacher/QuestionEditorList';
import { useAdminSession } from '../../hooks/useAdminSession';
import { useToast } from '../../context/ToastContext';
import { ApiError, adminApi, adminPost } from '../../lib/api';
import { fromTashkentInput, toTashkentInput } from '../../lib/format';
import type { Question, SchoolClass, TestItem } from '../../types/api';

export function TeacherTestEditorPage() {
  const { session, loading: sessionLoading } = useAdminSession('teacher');
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const testId = searchParams.get('id');

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState('');
  const [forClass, setForClass] = useState(true);
  const [forGroup, setForGroup] = useState(false);
  const [subject, setSubject] = useState('');
  const [direction, setDirection] = useState('');
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());

  const [testType, setTestType] = useState<'ordinary' | 'block'>('ordinary');
  const [scoringMode, setScoringMode] = useState<'normal' | 'dtm'>('normal');
  const [timeLimitMin, setTimeLimitMin] = useState(0);
  const [maxAttempts, setMaxAttempts] = useState(1);
  const [violationLimit, setViolationLimit] = useState(3);
  const [questionsPerAttempt, setQuestionsPerAttempt] = useState(0);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [shuffleOptions, setShuffleOptions] = useState(false);
  const [showAnswers, setShowAnswers] = useState(true);
  const [hideResults, setHideResults] = useState(false);
  const [scheduleStart, setScheduleStart] = useState('');
  const [scheduleEnd, setScheduleEnd] = useState('');

  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewBusy, setPreviewBusy] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [replacePreviewConfirm, setReplacePreviewConfirm] = useState<Question[] | null>(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [requestId] = useState(() =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`
  );

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const cls = await adminApi<SchoolClass[]>('classes');
      setClasses(cls);

      if (testId) {
        const test = await adminApi<TestItem>(`tests/${encodeURIComponent(testId)}`);
        setTitle(test.title || '');
        setSubject(test.subject || '');
        setDirection(test.direction || '');
        setTestType(test.testType === 'block' ? 'block' : 'ordinary');
        setScoringMode(test.settings.scoringMode === 'dtm' ? 'dtm' : 'normal');
        setTimeLimitMin(test.settings.timeLimitMin ?? 0);
        setMaxAttempts(test.settings.maxAttempts ?? 1);
        setViolationLimit(test.settings.violationLimit ?? 3);
        setQuestionsPerAttempt(test.settings.questionsPerAttempt ?? 0);
        setShuffleQuestions(Boolean(test.settings.shuffleQuestions));
        setShuffleOptions(Boolean(test.settings.shuffleOptions));
        setShowAnswers(test.settings.showAnswers ?? true);
        setHideResults(Boolean(test.settings.hideResults));
        setScheduleStart(toTashkentInput(test.schedule?.start));
        setScheduleEnd(toTashkentInput(test.schedule?.end));
        setQuestions(structuredClone(test.questions || []));

        const picked = cls.filter((c) => test.classIds.includes(c.id));
        setForClass(!picked.length || picked.some((c) => c.kind !== 'group'));
        setForGroup(picked.some((c) => c.kind === 'group'));
        setSelectedClassIds(new Set(test.classIds));
      }
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Test ma'lumotlarini yuklab bo'lmadi.", true);
    } finally {
      setLoading(false);
    }
  }, [testId, toast]);

  useEffect(() => {
    if (!sessionLoading && session) {
      loadData();
    }
  }, [sessionLoading, session, loadData]);

  const groupDirections = useMemo(
    () =>
      Array.from(
        new Set(classes.filter((c) => c.kind === 'group' && c.direction).map((c) => c.direction!))
      ).sort((a, b) => a.localeCompare(b, 'uz')),
    [classes]
  );

  const visibleClasses = useMemo(() => {
    return classes.filter((c) => {
      if (c.kind === 'group') return forGroup && (!direction || c.direction === direction);
      return forClass;
    });
  }, [classes, forClass, forGroup, direction]);

  const sectionsSummary = useMemo(() => {
    const map = new Map<string, { id: string; type: string; subject: string; count: number }>();
    for (const q of questions) {
      if (!q.section) continue;
      const existing = map.get(q.section.id) || { ...q.section, count: 0 };
      existing.count += 1;
      map.set(q.section.id, existing);
    }
    return Array.from(map.values());
  }, [questions]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPreviewError('');
    const file = e.target.files?.[0] || null;
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!/\.(doc|docx)$/i.test(file.name)) {
      e.target.value = '';
      setSelectedFile(null);
      toast('DOC yoki DOCX Word hujjatini tanlang.', true);
      return;
    }
    if (file.size > 4_000_000) {
      toast('Word fayli 4 MB dan oshmasin.', true);
      return;
    }
    setSelectedFile(file);
  };

  const applyPreviewQuestions = (next: Question[]) => {
    setQuestions(next);
    if (next.some((q) => q.section)) {
      setTestType('block');
      setScoringMode('dtm');
    }
    toast(`${next.length} savol tahlil qilindi. Pastda ko'rib chiqing va tahrirlang.`);
  };

  const handlePreview = async () => {
    setPreviewError('');
    if (!selectedFile) {
      setPreviewError('Avval .doc yoki .docx Word faylini tanlang.');
      return;
    }
    setPreviewBusy(true);
    try {
      const form = new FormData();
      form.append('file', selectedFile, selectedFile.name);
      const result = await adminApi<{ questions: Question[]; warnings?: { message: string }[] }>(
        'tests/preview',
        { method: 'POST', body: form }
      );
      if (result.warnings?.length) {
        setPreviewError(result.warnings.map((w) => w.message).join(' '));
      }
      if (questions.length > 0) {
        setReplacePreviewConfirm(result.questions);
      } else {
        applyPreviewQuestions(result.questions);
      }
    } catch (err) {
      setPreviewError(err instanceof Error ? err.message : "Faylni tahlil qilib bo'lmadi.");
    } finally {
      setPreviewBusy(false);
    }
  };

  const activeSelectedIds = useMemo(
    () =>
      Array.from(selectedClassIds).filter((id) =>
        visibleClasses.some((c) => c.id === id)
      ),
    [selectedClassIds, visibleClasses]
  );

  const handleOpenConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast('Test nomini kiriting.', true);
      return;
    }
    if (!activeSelectedIds.length) {
      toast('Kamida bitta sinf yoki guruhni tanlang.', true);
      return;
    }
    if (!questions.length) {
      toast('Kamida bitta savol kiriting yoki Word faylni preview qiling.', true);
      return;
    }
    setConfirmSaveOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        title: title.trim(),
        subject: subject.trim(),
        direction: forGroup ? direction.trim() : '',
        testType,
        classIds: activeSelectedIds,
        questions,
        settings: {
          timeLimitMin: Number(timeLimitMin) || 0,
          maxAttempts: Math.max(1, Number(maxAttempts) || 1),
          violationLimit: Math.max(0, Number(violationLimit) || 0),
          questionsPerAttempt: testType === 'ordinary' ? Math.max(0, Number(questionsPerAttempt) || 0) : 0,
          shuffleQuestions,
          shuffleOptions,
          showAnswers,
          hideResults,
          scoringMode: testType === 'block' ? scoringMode : 'normal',
        },
        schedule: {
          start: fromTashkentInput(scheduleStart),
          end: fromTashkentInput(scheduleEnd),
        },
        ...(!testId ? { requestId } : {}),
      };
      await adminPost(`tests${testId ? '/' + encodeURIComponent(testId) : ''}`, payload, testId ? 'PUT' : 'POST');
      toast('Test saqlandi.');
      setConfirmSaveOpen(false);
      navigate('/oqituvchi/testlar');
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Saqlashda xato yuz berdi.", true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminShell
      session={session}
      title={testId ? 'Testni tahrirlash' : 'Yangi test yaratish'}
      subtitle={
        testId
          ? 'Test nomi, sinflari va savollarini yangilang.'
          : 'Test nomi, sinflari va savollarini kiriting.'
      }
      actions={
        <Link
          to="/oqituvchi/testlar"
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Testlarga qaytish</span>
        </Link>
      }
    >
      {loading ? (
        <div className="space-y-4">
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
          <div className="h-64 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
        </div>
      ) : (
        <form onSubmit={handleOpenConfirm} className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Asosiy ma'lumotlar va auditoriya
            </h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block space-y-1.5 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Test nomi</span>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Masalan: 7-sinf Algebra 1-chorak nazorat"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <div className="space-y-2 sm:col-span-2">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Auditoriya turi</span>
                <div className="flex flex-wrap gap-4">
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={forClass}
                      onChange={(e) => setForClass(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span>Sinflar</span>
                  </label>
                  <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                    <input
                      type="checkbox"
                      checked={forGroup}
                      onChange={(e) => setForGroup(e.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600"
                    />
                    <span>Guruhlar</span>
                  </label>
                </div>
              </div>

              {forClass && (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Fan</span>
                  <input
                    type="text"
                    maxLength={100}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Masalan: Matematika"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
              )}

              {forGroup && (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Yo'nalish</span>
                  <input
                    type="text"
                    list="editor-directions"
                    required
                    maxLength={100}
                    value={direction}
                    onChange={(e) => setDirection(e.target.value)}
                    placeholder="Guruh yo'nalishini tanlang yoki yozing"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                  <datalist id="editor-directions">
                    {groupDirections.map((d) => (
                      <option key={d} value={d} />
                    ))}
                  </datalist>
                </label>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                Biriktirilgan sinf va guruhlar
              </span>
              {classes.length === 0 ? (
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Avval{' '}
                  <Link to="/oqituvchi/sinflar" className="underline font-medium">
                    Sinflar va guruhlar
                  </Link>{' '}
                  bo'limida sinf yarating.
                </p>
              ) : visibleClasses.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tanlangan auditoriya turi va yo'nalishga mos sinf/guruh topilmadi.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                  {visibleClasses.map((cls) => (
                    <label
                      key={cls.id}
                      className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <input
                        type="checkbox"
                        checked={selectedClassIds.has(cls.id)}
                        onChange={() =>
                          setSelectedClassIds((prev) => {
                            const next = new Set(prev);
                            if (next.has(cls.id)) next.delete(cls.id);
                            else next.add(cls.id);
                            return next;
                          })
                        }
                        className="h-4 w-4 rounded border-slate-300 text-blue-600"
                      />
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {cls.name}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
              Test sozlamalari va jadval
            </h2>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Test turi</span>
                <select
                  value={testType}
                  onChange={(e) => {
                    const next = e.target.value as 'ordinary' | 'block';
                    setTestType(next);
                    if (next === 'block') setScoringMode('dtm');
                  }}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="ordinary">Oddiy test</option>
                  <option value="block">Blok test</option>
                </select>
              </label>

              {testType === 'block' && (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Baholash rejimi</span>
                  <select
                    value={scoringMode}
                    onChange={(e) => setScoringMode(e.target.value as 'normal' | 'dtm')}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  >
                    <option value="dtm">DTM (189 ball)</option>
                    <option value="normal">Oddiy (1 ball)</option>
                  </select>
                </label>
              )}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Vaqt chegarasi (daqiqa, 0 = cheksiz)</span>
                <input
                  type="number"
                  min={0}
                  max={240}
                  value={timeLimitMin}
                  onChange={(e) => setTimeLimitMin(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Urinishlar soni</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Qoidabuzarlik limiti</span>
                <input
                  type="number"
                  min={0}
                  max={20}
                  value={violationLimit}
                  onChange={(e) => setViolationLimit(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              {testType === 'ordinary' && (
                <label className="block space-y-1.5">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Har urinishga savollar soni (0 = barchasi)
                  </span>
                  <input
                    type="number"
                    min={0}
                    max={200}
                    value={questionsPerAttempt}
                    onChange={(e) => setQuestionsPerAttempt(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </label>
              )}

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Natijani ko'rsatish</span>
                <select
                  value={hideResults ? 'hide' : 'show'}
                  onChange={(e) => setHideResults(e.target.value === 'hide')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="show">O'quvchiga ko'rsatilsin</option>
                  <option value="hide">Yashirilsin</option>
                </select>
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Boshlanish vaqti (Toshkent)</span>
                <input
                  type="datetime-local"
                  value={scheduleStart}
                  onChange={(e) => setScheduleStart(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>

              <label className="block space-y-1.5">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tugash vaqti (Toshkent)</span>
                <input
                  type="datetime-local"
                  value={scheduleEnd}
                  onChange={(e) => setScheduleEnd(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                />
              </label>
            </div>

            {testType === 'block' && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {scoringMode === 'dtm'
                  ? '1-mutaxassislik: 3,1; 2-mutaxassislik: 2,1; majburiy fanlar: 1,1 ball. Jami 189 ball.'
                  : "Oddiy baholash: har bir to'g'ri javob 1 ball. 3,1 / 2,1 / 1,1 uchun DTM rejimini tanlang."}
              </p>
            )}

            <div className="flex flex-wrap gap-5 pt-1">
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={shuffleQuestions}
                  onChange={(e) => setShuffleQuestions(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>Savollarni aralashtirish</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={shuffleOptions}
                  onChange={(e) => setShuffleOptions(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>Variantlarni aralashtirish</span>
              </label>
              <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={showAnswers}
                  onChange={(e) => setShowAnswers(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600"
                />
                <span>Yakunlangach to'g'ri javoblarni ko'rsatish</span>
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                  Word (.doc / .docx) orqali import
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Formulalar, jadvallar va rasmlar serverda xavfsiz tahlil qilinadi (maks. 4 MB).
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <input
                  type="file"
                  accept=".doc,.docx"
                  onChange={handleFileChange}
                  className="text-xs text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-700 hover:file:bg-slate-200 dark:text-slate-300 dark:file:bg-slate-800 dark:file:text-slate-200"
                />
                <button
                  type="button"
                  onClick={handlePreview}
                  disabled={previewBusy}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-60 whitespace-nowrap dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
                >
                  <FileUp className="h-3.5 w-3.5" />
                  <span>{previewBusy ? 'Tahlil qilinmoqda...' : 'Faylni tahlil qilish'}</span>
                </button>
              </div>
            </div>
            {previewError && (
              <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
                {previewError}
              </p>
            )}
          </section>

          <section className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-slate-900 dark:text-white">
                Savollar ({questions.length} ta)
              </h2>
              <button
                type="button"
                onClick={() => {
                  if (questions.length >= 200) {
                    toast('200 savoldan oshmasin.', true);
                    return;
                  }
                  setQuestions((prev) => [...prev, { q: '', options: ['', ''], answer: 0 }]);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Savol qo'shish</span>
              </button>
            </div>

            <QuestionEditorList questions={questions} onChange={setQuestions} />
          </section>

          <div className="sticky bottom-4 z-10 flex items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
            <Link
              to="/oqituvchi/testlar"
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
            >
              Bekor qilish
            </Link>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
            >
              <Save className="h-4 w-4" />
              <span>Testni saqlash</span>
            </button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={Boolean(replacePreviewConfirm)}
        onClose={() => setReplacePreviewConfirm(null)}
        onConfirm={() => {
          if (replacePreviewConfirm) applyPreviewQuestions(replacePreviewConfirm);
          setReplacePreviewConfirm(null);
        }}
        title="Mavjud savollar almashtirilsinmi?"
        message="Previewdagi savollar hozir tahrirlangan savollar o'rniga qo'yiladi."
        confirmLabel="Almashtirish"
      />

      <Modal
        open={confirmSaveOpen}
        onClose={() => setConfirmSaveOpen(false)}
        title="Testni saqlashni tasdiqlang"
        footer={
          <>
            <button
              type="button"
              onClick={() => setConfirmSaveOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:text-slate-200"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saqlanmoqda...' : 'Tasdiqlash va saqlash'}
            </button>
          </>
        }
      >
        <div className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
          <p>
            <strong>Test turi:</strong> {testType === 'block' ? 'Blok test' : 'Oddiy test'}
          </p>
          <p>
            <strong>{title}</strong> · {questions.length} savol
          </p>
          {shuffleQuestions && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {testType === 'block'
                ? "Savollar har bir fan bo'limining o'z ichida aralashtiriladi."
                : 'Savollar aralashtiriladi.'}
            </p>
          )}
          {testType === 'ordinary' && questionsPerAttempt > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Har urinishga bazadan {questionsPerAttempt} ta savol tanlanadi.
            </p>
          )}
          {sectionsSummary.map((sec) => (
            <p key={sec.id} className="text-xs text-slate-600 dark:text-slate-300">
              {sec.type} · {sec.subject}: {sec.count} savol
            </p>
          ))}
          <p>
            <strong>Auditoriya:</strong>{' '}
            {activeSelectedIds.map((id) => classes.find((c) => c.id === id)?.name || id).join(', ')}
          </p>
          <p>
            <strong>Vaqt:</strong> {timeLimitMin || 'Cheksiz'} daqiqa · <strong>Urinish:</strong> {maxAttempts}
          </p>
        </div>
      </Modal>
    </AdminShell>
  );
}
