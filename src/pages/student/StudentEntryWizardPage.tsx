import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, KeyRound, Play, School, UserRound } from 'lucide-react';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { ResumeAttemptBanner } from '../../components/student/ResumeAttemptBanner';
import { ConfirmDialog } from '../../components/ui/Modal';
import { api } from '../../lib/api';
import {
  getBrowserKey,
  hasOpenAttempt,
  loadAttempt,
  saveAttempt,
} from '../../lib/attemptStorage';
import type { AttemptState, SchoolClass } from '../../types/api';

interface ResolvedEntry {
  school: { public_school_id: string; name: string };
  test: {
    id: string;
    title: string;
    count: number;
    settings: { timeLimitMin: number; maxAttempts: number };
  };
  classes: SchoolClass[];
}

const STEPS = [
  { num: 1, title: 'Kodlar', icon: KeyRound },
  { num: 2, title: 'Sinf', icon: School },
  { num: 3, title: 'Ism', icon: UserRound },
  { num: 4, title: 'Tasdiqlash', icon: Play },
];

export function StudentEntryWizardPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [schoolId, setSchoolId] = useState(() => params.get('schoolId') || '');
  const [testCode, setTestCode] = useState(() => params.get('code') || '');
  const [resolved, setResolved] = useState<ResolvedEntry | null>(null);
  const [classId, setClassId] = useState('');
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmOverwrite, setConfirmOverwrite] = useState(false);

  useEffect(() => {
    if (params.get('legacy') === '1') {
      navigate('/eski-testlar', { replace: true });
    }
  }, [params, navigate]);

  const handleCodeChange = (nextSchool: string, nextCode: string) => {
    setSchoolId(nextSchool);
    setTestCode(nextCode);
    setResolved(null);
    setClassId('');
    setError('');
    if (step !== 1) setStep(1);
  };

  const handleResolve = async () => {
    const cleanSchool = schoolId.trim().toUpperCase();
    const cleanCode = testCode.trim();
    if (!cleanSchool) {
      setError('Maktab IDsini kiriting (masalan, SK-1001).');
      return;
    }
    if (!/^[0-9]{6}$/.test(cleanCode)) {
      setError("Test kodi aniq 6 ta raqamdan iborat bo'lishi kerak.");
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await api<ResolvedEntry>('school-entry/resolve', {
        method: 'POST',
        body: JSON.stringify({
          public_school_id: cleanSchool,
          testCode: cleanCode,
          browserKey: getBrowserKey(),
        }),
      });
      setResolved(data);
      setSchoolId(data.school.public_school_id);
      if (data.classes.length === 1) setClassId(data.classes[0].id);
    } catch (err) {
      setResolved(null);
      setError(err instanceof Error ? err.message : 'Kodlarni tekshirib bo\'lmadi.');
    } finally {
      setBusy(false);
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (step === 1) {
      if (!resolved) {
        await handleResolve();
        return;
      }
      setStep(2);
      return;
    }
    if (step === 2) {
      if (!resolved?.classes.some((c) => c.id === classId)) {
        setError('Davom etish uchun sinf yoki guruhingizni tanlang.');
        return;
      }
      setStep(3);
      return;
    }
    if (step === 3) {
      if (!name.trim() || name.trim().length > 60) {
        setError('Ismingizni kiriting (1–60 belgi).');
        return;
      }
      if (!surname.trim() || surname.trim().length > 60) {
        setError('Familiyangizni kiriting (1–60 belgi).');
        return;
      }
      setStep(4);
      return;
    }
    await tryStartAttempt();
  };

  const tryStartAttempt = async () => {
    if (!resolved) return;
    setBusy(true);
    setError('');
    try {
      const existing = loadAttempt();
      if (existing && (await hasOpenAttempt(existing.attemptId || existing.attemptToken))) {
        throw new Error("Test boshqa oynada ochiq. O'sha oynada davom eting yoki uni yoping.");
      }
      if (existing && !confirmOverwrite) {
        setBusy(false);
        setConfirmOverwrite(true);
        return;
      }
      await performStart(existing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Testni boshlab bo'lmadi.");
      setBusy(false);
    }
  };

  const performStart = async (existing = loadAttempt()) => {
    if (!resolved) return;
    setBusy(true);
    setConfirmOverwrite(false);
    try {
      const attempt = await api<AttemptState>('school-entry/start', {
        method: 'POST',
        body: JSON.stringify({
          public_school_id: schoolId.trim().toUpperCase(),
          testCode: testCode.trim(),
          classId,
          name: name.trim(),
          surname: surname.trim(),
          browserKey: getBrowserKey(),
        }),
      });
      const same =
        existing &&
        (existing.attemptId === attempt.attemptId || existing.attemptToken === attempt.attemptToken);
      const keepLocal = Boolean(same && existing && existing.draftVersion >= (attempt.draftVersion || 0));
      const nextState: AttemptState = {
        ...(same && existing ? existing : {}),
        ...attempt,
        answers: keepLocal && existing
          ? existing.answers
          : attempt.answers || Array(attempt.questions.length).fill(null),
        draftVersion: keepLocal && existing ? existing.draftVersion : attempt.draftVersion || 0,
        dirty: Boolean(keepLocal && existing?.dirty),
        flags: same && existing ? existing.flags : [],
        current: same && existing ? existing.current : 0,
        clockReceivedAt: Date.now(),
      };
      if (!saveAttempt(nextState)) {
        throw new Error("Qurilmada saqlash imkoni yo'q. Brauzer sozlamalarini tekshiring.");
      }
      try {
        if (document.documentElement.requestFullscreen && document.fullscreenEnabled) {
          await document.documentElement.requestFullscreen({ navigationUI: 'hide' });
        }
      } catch {
        /* ExamGuard inside TestRunnerPage handles fullscreen gracefully */
      }
      navigate('/test');
    } catch (err) {
      setError(err instanceof Error ? err.message : "Testni boshlab bo'lmadi.");
    } finally {
      setBusy(false);
    }
  };

  const chosenClass = resolved?.classes.find((c) => c.id === classId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <PublicHeader ctaLabel="Bosh sahifa" ctaTo="/" />

      <main className="mx-auto max-w-2xl space-y-6 px-4 py-10 sm:px-6">
        <ResumeAttemptBanner />

        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <div className="border-b border-slate-200 pb-6 dark:border-slate-800">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Testga kirish
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Taymer faqat oxirgi bosqichda «Testni boshlash» tugmasini bosganingizdan keyin ishlaydi.
            </p>

            <ol className="mt-6 grid grid-cols-4 gap-2" aria-label="Kirish bosqichlari">
              {STEPS.map((item) => {
                const Icon = item.icon;
                const active = step === item.num;
                const done = step > item.num;
                return (
                  <li
                    key={item.num}
                    className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-950/50 dark:text-blue-300'
                        : done
                          ? 'border-emerald-200 bg-emerald-50/70 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300'
                          : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">
                      {item.num}. {item.title}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          <form onSubmit={handleNext} className="mt-6 space-y-5">
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="public-school-id"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Maktab IDsi
                  </label>
                  <input
                    id="public-school-id"
                    value={schoolId}
                    onChange={(e) => handleCodeChange(e.target.value, testCode)}
                    placeholder="Masalan: SK-1001"
                    maxLength={40}
                    autoComplete="off"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-base uppercase tracking-wider text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="test-code"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    6 raqamli test kodi
                  </label>
                  <input
                    id="test-code"
                    value={testCode}
                    onChange={(e) =>
                      handleCodeChange(schoolId, e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="000000"
                    autoComplete="off"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 font-mono text-xl font-semibold tracking-[0.35em] tabular-nums text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>

                {resolved ? (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-4 text-sm text-emerald-900 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="font-semibold">{resolved.test.title}</p>
                      <p className="mt-0.5 text-xs opacity-90">
                        {resolved.school.name} · {resolved.school.public_school_id} ·{' '}
                        {resolved.test.count} ta savol
                      </p>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={handleResolve}
                    className="w-full rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-200 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
                  >
                    {busy ? 'Tekshirilmoqda...' : 'Kodlarni tekshirish'}
                  </button>
                )}
              </div>
            )}

            {step === 2 && resolved && (
              <div className="space-y-3">
                <label
                  htmlFor="grade-select"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Sinf yoki guruhingizni tanlang
                </label>
                <select
                  id="grade-select"
                  value={classId}
                  onChange={(e) => {
                    setClassId(e.target.value);
                    setError('');
                  }}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                >
                  <option value="">Sinf yoki guruhni tanlang</option>
                  {resolved.classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                      {c.direction ? ` (${c.direction})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="student-surname"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Familiya
                  </label>
                  <input
                    id="student-surname"
                    value={surname}
                    onChange={(e) => {
                      setSurname(e.target.value);
                      setError('');
                    }}
                    maxLength={60}
                    placeholder="Masalan: Aliyev"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
                <div>
                  <label
                    htmlFor="student-name"
                    className="block text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Ism
                  </label>
                  <input
                    id="student-name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError('');
                    }}
                    maxLength={60}
                    placeholder="Masalan: Sardor"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/15 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                  />
                </div>
              </div>
            )}

            {step === 4 && resolved && (
              <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950">
                <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
                  Ma'lumotlarni tekshiring
                </h2>
                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Maktab</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {resolved.school.name} ({resolved.school.public_school_id})
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Test</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {resolved.test.title}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Sinf / Guruh</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {chosenClass?.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">O'quvchi</dt>
                    <dd className="font-medium text-slate-900 dark:text-white">
                      {surname.trim()} {name.trim()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Savollar soni</dt>
                    <dd className="font-mono font-medium tabular-nums text-slate-900 dark:text-white">
                      {resolved.test.count} ta
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-500 dark:text-slate-400">Ajratilgan vaqt</dt>
                    <dd className="font-mono font-medium tabular-nums text-slate-900 dark:text-white">
                      {resolved.test.settings.timeLimitMin
                        ? `${resolved.test.settings.timeLimitMin} daqiqa`
                        : 'Cheklanmagan'}
                    </dd>
                  </div>
                </dl>
              </div>
            )}

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300"
              >
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-3 pt-2">
              {step > 1 ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setStep((s) => s - 1);
                    setError('');
                  }}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>Orqaga</span>
                </button>
              ) : (
                <Link
                  to="/eski-testlar"
                  className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Kodsiz ochiq testlar
                </Link>
              )}

              <button
                type="submit"
                disabled={busy || (step === 1 && !resolved)}
                className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-50"
              >
                <span>
                  {busy
                    ? 'Bajarilmoqda...'
                    : step === 4
                      ? 'Testni boshlash'
                      : 'Davom etish'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      </main>

      <ConfirmDialog
        open={confirmOverwrite}
        onClose={() => setConfirmOverwrite(false)}
        onConfirm={() => performStart()}
        title="Yangi test boshlansinmi?"
        description="Shu qurilmadagi oldingi test javoblari yangi urinish bilan almashtiriladi. Oldingi urinish muddati serverda davom etadi."
        confirmLabel="Yangi testni boshlash"
      />
    </div>
  );
}
