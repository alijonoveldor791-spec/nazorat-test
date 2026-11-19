// migrations/legacy.mjs: serverdagi shu qatlam vazifasi.
import { DEFAULT_VIOLATION_LIMIT, violationSettings } from './exam-violations.mjs';
import { hash, norm } from '../lib/identity.mjs';
export const legacyClassId = (name) => 'legacy-' + hash(norm(name)).slice(0, 20);
export function adaptTest(t, key) {
  return {
    ...t,
    id: t.id || key,
    title: t.title || 'Eski test',
    classIds: Array.isArray(t.classIds) ? t.classIds : (t.grades || []).map(legacyClassId),
    questions: t.questions || [],
    settings: {
      violationLimit: DEFAULT_VIOLATION_LIMIT,
      timeLimitMin: 0,
      maxAttempts: 100,
      shuffleQuestions: false,
      shuffleOptions: false,
      showAnswers: false,
      ...violationSettings(t.settings),
    },
    schedule: { start: null, end: null, ...t.schedule },
    createdAt: Object.hasOwn(t, 'createdAt') ? t.createdAt : t.created || null,
    created: t.created || new Date(0).toISOString(),
    updated: t.updated || t.created || new Date(0).toISOString(),
  };
}
export function adaptResult(r, key) {
  return {
    violationCount: 0,
    violationLog: [],
    terminatedViolation: false,
    ...r,
    id: r.id || key,
    classId: r.classId || legacyClassId(r.grade || ''),
    name: r.name || '',
    surname: r.surname || '',
    grade: r.grade || '',
    time: r.time || new Date(0).toISOString(),
    answers: Array.isArray(r.answers) ? r.answers : [],
    durationSec: r.durationSec ?? null,
    score: Number(r.score) || 0,
    total: Number(r.total) || 0,
    ...(r.dtmScore !== undefined ? { dtmScore: Number(r.dtmScore) } : {}),
  };
}
