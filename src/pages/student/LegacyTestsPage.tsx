import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { ResumeAttemptBanner } from '../../components/student/ResumeAttemptBanner';
import { EmptyState } from '../../components/ui/EmptyState';
import { api } from '../../lib/api';
import { getBrowserKey, saveAttempt } from '../../lib/attemptStorage';
import type { AttemptState, SchoolClass } from '../../types/api';

interface PublicTestSummary {
  id: string;
  title: string;
  questionCount?: number;
  questions?: unknown[];
  settings: { timeLimitMin: number; maxAttempts: number };
}

export function LegacyTestsPage() {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [tests, setTests] = useState<PublicTestSummary[]>([]);
  const [selectedTest, setSelectedTest] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api<SchoolClass[]>('classes')
      .then((rows) => {
        setClasses(rows);
        if (rows.length > 0) setSelectedClass(rows[0].id);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Sinflar yuklanmadi.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedClass) {
      setTests([]);
      setSelectedTest('');
      return;
    }
    api<PublicTestSummary[]>(`tests?classId=${encodeURIComponent(selectedClass)}`)
      .then((rows) => {
        setTests(rows);
        setSelectedTest(rows[0]?.id || '');
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Testlar yuklanmadi.'));
  }, [selectedClass]);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) {
      setError('Avval testni tanlang.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const attempt = await api<AttemptState>(`tests/${encodeURIComponent(selectedTest)}/start`, {
        method: 'POST',
        body: JSON.stringify({
          classId: selectedClass,
          name: name.trim(),
          surname: surname.trim(),
          accessCode: accessCode.trim() || undefined,
          browserKey: getBrowserKey(),
        }),
      });
      saveAttempt({
        ...attempt,
        answers: attempt.answers || Array(attempt.questions.length).fill(null),
        flags: [],
        current: 0,
        draftVersion: attempt.draftVersion || 0,
        dirty: false,
        clockReceivedAt: Date.now(),
      });
      navigate('/test');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Testni boshlab bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <PublicHeader ctaLabel="Kod bilan kirish" ctaTo="/test-kirish" />

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
        <ResumeAttemptBanner />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5 dark:border-slate-800">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h1 className="font-display text-xl font-bold text-slate-900 dark:text-white">
                Ochiq testlar
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Sinf va faol testni tanlab ishlash
              </p>
            </div>
          </div>

          {loading ? (
            <p className="py-8 text-center text-sm text-slate-500">Yuklanmoqda...</p>
          ) : classes.length === 0 ? (
            <div className="pt-6">
              <EmptyState
                title="Ochiq sinf topilmadi"
                description="Maktab kodi bilan kirish uchun «Kod bilan kirish» tugmasidan foydalaning."
              />
            </div>
          ) : (
            <form onSubmit={handleStart} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Sinf
                </label>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Test
                </label>
                <select
                  value={selectedTest}
                  onChange={(e) => setSelectedTest(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  {tests.length === 0 && <option value="">Faol testlar yo'q</option>}
                  {tests.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title} ({t.questionCount ?? t.questions?.length ?? 0} savol)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Familiya
                  </label>
                  <input
                    value={surname}
                    onChange={(e) => setSurname(e.target.value)}
                    required
                    maxLength={60}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Ism
                  </label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    maxLength={60}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Shaxsiy kod (agar ro'yxatli sinf bo'lsa)
                </label>
                <input
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  maxLength={20}
                  placeholder="Ixtiyoriy"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </div>

              {error && (
                <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy || !selectedTest}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                <span>{busy ? 'Boshlanmoqda...' : 'Testni boshlash'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
