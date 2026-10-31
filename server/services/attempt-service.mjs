// O’quvchi identifikatsiyasi va atomik urinishni boshlash.
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import * as resultsRepo from '../repositories/results-repo.mjs';
import * as retakesRepo from '../repositories/retakes-repo.mjs';
import { listClasses } from './class-service.mjs';
import { findTest, requireAvailable } from './test-service.mjs';
import { fail } from '../lib/http.mjs';
import { hash, norm } from '../lib/identity.mjs';
import { string } from '../lib/validate.mjs';
import { presentation } from '../lib/shuffle.mjs';
import { secret } from '../lib/env.mjs';
import { sign } from '../lib/auth-token.mjs';
import { limit } from '../lib/rate-limit.mjs';
import { codeMatches } from '../lib/student-code.mjs';
import { questionsValid } from '../lib/validate.mjs';

async function identity(payload, test) {
  const cls = (await listClasses(true)).find((c) => c.id === payload.classId);
  if (!cls || !test.classIds.includes(cls.id)) fail('Bu test sinfingizga biriktirilmagan.', 403);
  let person;
  if (cls.students.length) {
    person = cls.students.find((s) => codeMatches(payload.studentCode, s.accessCode));
    if (!person) fail('O’quvchi kodi noto’g’ri. O’qituvchingizdan shaxsiy kodni oling.', 403);
  } else
    person = {
      id: null,
      name: string(payload.name, 'Ism', 60),
      surname: string(payload.surname, 'Familiya', 60),
    };
  const key = hash(test.id + '|' + cls.id + '|' + norm(person.surname + ' ' + person.name));
  return {
    key,
    classId: cls.id,
    grade: cls.name,
    studentId: person.id,
    name: person.name,
    surname: person.surname,
  };
}
function attemptView(attempt) {
  return {
    attemptToken: sign(
      { role: 'attempt', id: attempt.id, exp: attempt.tokenExpires || attempt.expires + 7 * 86400000 },
      secret()
    ),
    title: attempt.title,
    questions: attempt.questions.map((q) => ({ q: q.q, options: q.options })),
    identity: attempt.identity,
    deadline: attempt.deadline,
    started: attempt.started,
    attemptId: attempt.id,
    serverNow: new Date().toISOString(),
    answers: attempt.answers || Array(attempt.questions.length).fill(null),
    draftVersion: attempt.draftVersion || 0,
  };
}
export async function startAttempt(testId, payload, ip) {
  await limit('start', ip, 240);
  const test = await findTest(testId);
  requireAvailable(test);
  secret();
  questionsValid(test.questions);
  const browserKey = string(payload.browserKey, 'Brauzer kaliti', 100);
  if (!/^[a-f0-9-]{32,100}$/i.test(browserKey)) fail('Brauzer kaliti yaroqsiz. Sahifani yangilang.');
  const who = await identity(payload, test),
    now = Date.now();
  const attempts = await attemptsRepo.listForIdentity(who.key);
  let active = attempts.find(
    (a) => !a.finished && a.expires > now && (!a.deadline || Date.parse(a.deadline) > now)
  );
  if (active && (await resultsRepo.find(active.id.split('/').at(-1)))) {
    await attemptsRepo.update(active.id, (current) => ({ ...current, finished: true }));
    active = null;
  }
  if (active) {
    if (active.ownerHash !== hash(browserKey))
      fail('Bu urinish boshqa brauzerda boshlangan. O’sha brauzerda davom eting.', 409);
    return { value: attemptView(active), status: 200 };
  }
  const oldResults = (await resultsRepo.list(true)).filter(
    (r) =>
      !attempts.some((a) => a.id === r.attemptId) &&
      r.testId === test.id &&
      (r.classId === who.classId || norm(r.grade) === norm(who.grade)) &&
      norm(r.surname + ' ' + r.name) === norm(who.surname + ' ' + who.name)
  );
  const grant = await retakesRepo.find(who.key);
  if (attempts.length + oldResults.length >= test.settings.maxAttempts + (grant?.extra || 0))
    fail('Topshirish limiti tugagan. O’qituvchingizdan ruxsat so’rang.', 403);
  const id = who.key + '/' + hash(who.key + ':' + attempts.length).slice(0, 40);
  const deadline = Math.min(
    test.settings.timeLimitMin ? now + test.settings.timeLimitMin * 60000 : Infinity,
    test.schedule.end ? Date.parse(test.schedule.end) : Infinity
  );
  const attempt = {
    id,
    identity: who,
    testId: test.id,
    title: test.title,
    revision: test.updated,
    questions: presentation(test.questions, test.settings, id),
    settings: test.settings,
    started: new Date(now).toISOString(),
    deadline: Number.isFinite(deadline) ? new Date(deadline).toISOString() : null,
    expires: Number.isFinite(deadline) ? deadline : now + 24 * 3600000,
    tokenExpires: (Number.isFinite(deadline) ? deadline : now + 86400000) + 7 * 86400000,
    finished: false,
    ownerHash: hash(browserKey),
    answers: Array(test.questions.length).fill(null),
    draftVersion: 0,
  };
  if (!(await attemptsRepo.create(attempt))) {
    const existing = await attemptsRepo.find(id);
    if (existing.ownerHash !== hash(browserKey)) fail('Urinish boshqa brauzerga tegishli.', 409);
    if (existing.finished) fail('Bu urinish yakunlangan. Sahifani yangilang.', 409);
    return { value: attemptView(existing), status: 200 };
  }
  return { value: attemptView(attempt), status: 201 };
}
