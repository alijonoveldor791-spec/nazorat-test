// O\'quvchi identifikatsiyasi va atomik urinishni boshlash.
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
import { currentAccess } from '../lib/access-context.mjs';
import { reserveAttempt } from './attempt-start-service.mjs';

async function identity(payload, test) {
  const cls = (await listClasses(true)).find((c) => c.id === payload.classId);
  if (!cls || !test.classIds.includes(cls.id)) fail('Bu test sinfingizga biriktirilmagan.', 403);
  let person;
  if (cls.students.length && currentAccess()?.role !== 'school_student') {
    person = cls.students.find((s) => codeMatches(payload.studentCode, s.accessCode));
    if (!person) fail("O'quvchi kodi noto'g'ri. O'qituvchingizdan shaxsiy kodni oling.", 403);
  } else
    person = {
      id: null,
      name: string(payload.name, 'Ism', 60),
      surname: string(payload.surname, 'Familiya', 60),
    };
  const key = hash(
    test.id +
      '|' +
      cls.id +
      '|' +
      norm(person.surname + ' ' + person.name) +
      (currentAccess()?.role === 'school_student' ? '|' + payload.browserKey : '')
  );
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
      {
        role: 'attempt',
        id: attempt.id,
        schoolId: attempt.schoolId || null,
        exp: attempt.tokenExpires || attempt.expires + 7 * 86400000,
      },
      secret()
    ),
    title: attempt.title,
    questions: attempt.questions.map((q) => ({ q: q.q, options: q.options })),
    identity: attempt.identity,
    deadline: attempt.deadline || new Date(attempt.expires).toISOString(),
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
  const who = await identity(payload, test);
  const requestId = payload.requestId === undefined ? null : string(payload.requestId, 'Start ID', 100);
  if (requestId && !/^[a-f0-9-]{32,100}$/i.test(requestId)) fail('Start ID yaroqsiz.');
  const reserved = await reserveAttempt(test, who, browserKey, requestId, (id) => {
    requireAvailable(test);
    const now = Date.now();
    const deadline = Math.min(
      test.settings.timeLimitMin ? now + test.settings.timeLimitMin * 60000 : Infinity,
      test.schedule.end ? Date.parse(test.schedule.end) : Infinity
    );
    return {
      id,
      ...(currentAccess()?.schoolId ? { schoolId: currentAccess().schoolId } : {}),
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
  });
  return { value: attemptView(reserved.attempt), status: reserved.created ? 201 : 200 };
}
