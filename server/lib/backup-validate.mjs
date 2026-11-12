// Zaxiradan faqat tanilgan maydonlarni tiklashga ruxsat beradi.
import { validateQuestionBank } from './question-bank.mjs';
import { fail } from './http.mjs';
import { object, string, integer, questionsValid, settingsValid, scheduleValid } from './validate.mjs';
import { testClassification } from './test-classification.mjs';
import { sectionResults } from './section-results.mjs';
import { scoringPolicy } from './scoring-policy.mjs';
import { grade } from './grade.mjs';
import { adaptTest, adaptResult } from '../migrations/legacy.mjs';
export function validId(value) {
  const id = string(value, 'ID', 160);
  if (!/^[\w-]+$/.test(id)) fail("Zaxira ID noto'g'ri.");
  return id;
}
const optionalText = (value, label, max = 200) => (value == null ? null : string(value, label, max, false));
function date(value, label) {
  if (typeof value !== 'string' || !Number.isFinite(Date.parse(value))) fail(label + " noto'g'ri.");
  return new Date(value).toISOString();
}
export function restoreTest(raw, classes) {
  object(raw);
  const t = adaptTest(raw, validId(raw.id));
  if (!Array.isArray(t.classIds) || t.classIds.length > 40 || t.classIds.some((id) => !classes.has(id)))
    fail("Zaxirada test sinfi yo'q.");
  if (typeof t.active !== 'boolean') fail("Test holati mantiqiy qiymat bo'lsin.");
  const questions = questionsValid(t.questions);
  const classification = testClassification(
    t,
    questions,
    t.classIds.map((id) => classes.get(id))
  );
  const settings = settingsValid(t.settings);
  validateQuestionBank(questions, settings, classification.testType);
  scoringPolicy(questions, settings.scoringMode, classification.testType);
  return {
    id: t.id,
    title: string(t.title, 'Test nomi', 100),
    ...(t.subject !== undefined ? { subject: string(t.subject, 'Fan', 100, false) } : {}),
    ...classification,
    classIds: [...new Set(t.classIds)],
    grades: t.classIds.map((id) => classes.get(id).name),
    questions,
    settings: {
      ...settings,
      ...(classification.testType === 'block' ? { shuffleQuestions: false } : {}),
    },
    schedule: scheduleValid(t.schedule),
    active: t.active,
    created: date(t.created, 'Yaratilgan vaqt'),
    ...(t.createdAt && Number.isFinite(Date.parse(t.createdAt))
      ? { createdAt: new Date(t.createdAt).toISOString() }
      : {}),
    updated: date(t.updated, 'Yangilangan vaqt'),
  };
}
function permutation(value, length, label) {
  if (!Array.isArray(value) || value.length !== length || new Set(value).size !== length)
    fail(label + " noto'g'ri.");
  value.forEach((n) => integer(n, label, 0, length - 1));
  return value;
}
export function restoreResult(raw) {
  object(raw);
  const r = adaptResult(raw, validId(raw.id));
  integer(raw.total, 'Jami', 0, 200);
  integer(raw.score, 'Ball', 0, raw.total);
  const sourceQuestionCount =
    raw.sourceQuestionCount === undefined
      ? raw.questions?.length || 0
      : integer(raw.sourceQuestionCount, 'Baza savollari', raw.total, 200);
  let questions = [],
    answers = [];
  if (raw.questions?.length) {
    questions = questionsValid(raw.questions).map((q, i) => ({
      ...q,
      sourceIndex: integer(raw.questions[i].sourceIndex ?? i, 'Savol tartibi', 0, sourceQuestionCount - 1),
      ...(raw.questions[i].sourceOptions
        ? { sourceOptions: permutation(raw.questions[i].sourceOptions, q.options.length, 'Variant tartibi') }
        : {}),
    }));
    if (new Set(questions.map((q) => q.sourceIndex)).size !== questions.length)
      fail('Zaxirada savol takrorlangan.');
    answers = raw.answers;
    const scored = grade(questions, answers);
    if (scored.score !== raw.score || scored.total !== raw.total) fail('Zaxira bali javoblarga mos emas.');
  } else if (raw.answers?.length) fail("Javoblar uchun savollar nusxasi yo'q.");
  const policy = scoringPolicy(questions, raw.scoringMode ?? 'normal');
  const dtm = policy.mode === 'dtm' ? grade(questions, answers, policy) : null;
  if (
    dtm &&
    (dtm.dtmScore !== raw.dtmScore ||
      dtm.maxScore !== raw.maxScore ||
      JSON.stringify(raw.scoringPolicy) !== JSON.stringify(policy))
  )
    fail('Zaxira DTM bali yoki koeffitsiyentlari mos emas.');
  const attemptId = optionalText(raw.attemptId, 'Urinish ID');
  if (attemptId && (!/^[\w-]+\/[\w-]+$/.test(attemptId) || attemptId.split('/').at(-1) !== r.id))
    fail('Natija va urinish ID mos emas.');
  const identityKey = optionalText(raw.identityKey, "O'quvchi kaliti", 64);
  if (identityKey && !/^[a-f0-9]{64}$/.test(identityKey)) fail("O'quvchi kaliti noto'g'ri.");
  return {
    id: r.id,
    testId: validId(raw.testId),
    testTitle: string(raw.testTitle || 'Eski test', 'Test nomi', 100),
    classId: validId(r.classId),
    grade: string(r.grade, 'Sinf', 60),
    name: string(raw.name, 'Ism', 60),
    surname: string(raw.surname, 'Familiya', 60),
    studentId: optionalText(raw.studentId, "O'quvchi ID", 100),
    ...(attemptId ? { attemptId } : {}),
    ...(identityKey ? { identityKey } : {}),
    sections: sectionResults(questions, answers, policy),
    ...(dtm
      ? {
          scoringMode: policy.mode,
          scoringPolicy: policy,
          correctCount: raw.score,
          dtmScore: dtm.dtmScore,
          maxScore: dtm.maxScore,
        }
      : {}),
    score: raw.score,
    total: raw.total,
    answers,
    questions,
    ...(raw.sourceQuestionCount !== undefined ? { sourceQuestionCount } : {}),
    revision: optionalText(raw.revision, 'Tahrir', 100),
    durationSec: raw.durationSec == null ? null : integer(raw.durationSec, 'Sarflangan vaqt', 0, 7 * 86400),
    time: date(raw.time, 'Natija vaqti'),
    showAnswersAllowed: raw.showAnswersAllowed === true,
    hideResults: raw.hideResults === true,
    timedOut: raw.timedOut === true,
  };
}
