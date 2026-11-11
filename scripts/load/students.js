// Har VU bitta mustaqil o'quvchi sessiyasini resolve-dan natijagacha ishlatadi.
import { sleep, check } from 'k6';
import exec from 'k6/execution';
import { Counter } from 'k6/metrics';
import { sha256 } from 'k6/crypto';
import { request } from './request.js';
const fixture = JSON.parse(open(__ENV.FIXTURE));
const target = __ENV.LOAD_BASE_URL || fixture.baseUrl;
if (target !== fixture.baseUrl || __ENV.CONFIRM_LOAD_TARGET !== target)
  throw Error('CONFIRM_LOAD_TARGET fixture originiga teng bolsin.');
if (!['local-emulator', 'staging'].includes(fixture.environment))
  throw Error('Production target taqiqlangan.');
if (fixture.environment === 'staging' && (!__ENV.PRODUCTION_ORIGIN || __ENV.PRODUCTION_ORIGIN === target))
  throw Error('Staging uchun boshqa PRODUCTION_ORIGIN kerak.');
const count = Number(__ENV.STUDENTS || 50),
  hold = Number(__ENV.HOLD_SECONDS || 30),
  window = Number(__ENV.START_WINDOW || 30);
const warmup = Number(__ENV.WARMUP_SECONDS || 30),
  submitWindow = Number(__ENV.SUBMIT_WINDOW || 25);
const deadlineMode = __ENV.DEADLINE_MODE === 'true';
if (!Number.isInteger(count) || count < 1 || count > 500 || !Number.isFinite(hold) || hold < 1 || hold > 3600 || !Number.isFinite(window) || window < 0 || window > 300 || !Number.isFinite(warmup) || warmup < 0 || warmup > 300 || !Number.isFinite(submitWindow) || submitWindow < 0 || submitWindow > 30) throw Error('STUDENTS 1-500; HOLD 1-3600; START/WARMUP 0-300; SUBMIT 0-30.');
const kind = __ENV.TEST_KIND || 'ordinary',
  run = __ENV.RUN_ID;
if (!run || run.length > 30 || !/^[a-z0-9-]+$/i.test(run))
  throw Error('Noyob RUN_ID: 1-30 harf, raqam yoki defis kerak.');
if (
  deadlineMode &&
  fixture.schools.some(
    (s) => !s.tests[kind].scheduleEnd || Date.parse(s.tests[kind].scheduleEnd) - Date.now() < hold * 1000
  )
)
  throw Error('Yangi deadline fixture kerak; LOAD_DEADLINE_SECONDS=1350 bilan seed qiling.');
export const started = new Counter('sessions_started');
export const completed = new Counter('sessions_completed');
export const ended = new Counter('sessions_ended');
const expectation = new Counter('session_expectation');
export const held = new Counter('sessions_held_full_duration');
export const options = {
  scenarios: {
    students: {
      executor: 'per-vu-iterations',
      vus: count,
      iterations: 1,
      maxDuration: `${hold + window + warmup + submitWindow + 300}s`,
      exec: 'student',
    },
    teacher: {
      executor: 'constant-vus',
      vus: 1,
      duration: `${deadlineMode ? Math.max(...fixture.schools.map((s) => Math.ceil((Date.parse(s.tests[kind].scheduleEnd) - Date.now()) / 1000))) + 10 : hold + window + warmup + submitWindow + 5}s`,
      exec: 'teacher',
      gracefulStop: '60s',
    },
  },
  thresholds: {
    'operation_ms{op:resolve}': ['p(95)>=0'],
    'operation_ms{op:resume}': ['p(95)>=0'],
    'operation_ms{op:results}': ['p(95)>=0'],
    'operation_ms{op:draft}': ['p(95)<2000'],
    'operation_ms{op:start}': ['p(95)<3000'],
    'operation_ms{op:submit}': ['p(95)<3000'],
    valid_server_errors: ['rate<0.01'],
    valid_rejections: ['rate==0'],
    checks: ['rate==1'],
    sessions_started: [`count==${count}`],
    sessions_completed: [`count==${count}`],
    sessions_held_full_duration: [`count==${count}`],
  },
  summaryTrendStats: ['min', 'med', 'avg', 'p(90)', 'p(95)', 'p(99)', 'max'],
};
function answer(index, id) {
  return (index + (id % 5 === 0 && index % 7 === 0 ? 1 : 0)) % 4;
}
export function student() {
  const id = exec.vu.idInTest,
    school = fixture.schools[(id - 1) % fixture.schools.length],
    test = school.tests[kind];
  sleep((((id - 1) % count) * window) / count);
  const browserKey = `${fixture.run}-${run}-${id}`
    .split('')
    .map((c) => c.charCodeAt(0).toString(16))
    .join('')
    .padEnd(32, 'a')
    .slice(0, 100);
  const identity = {
    public_school_id: school.publicId,
    testCode: test.code,
    browserKey,
    classId: school.classIds[id % 2],
    name: `Student ${id}`,
    surname: `Load-${run}`,
  };
  if (!request(fixture, 'school-entry/resolve', identity).ok) {
    check(false, { 'resolve succeeded': (v) => v });
    return;
  }
  const start = request(fixture, 'school-entry/start', identity);
  if (!check(start, { 'start succeeded': (r) => r.ok && !!r.value.attemptToken })) return;
  const session = { attemptToken: start.value.attemptToken, browserKey },
    answers = Array(test.count).fill(null);
  const began = Date.now(),
    until = deadlineMode
      ? Date.parse(test.scheduleEnd) - (submitWindow + 5) * 1000
      : exec.scenario.startTime + (window + warmup + hold) * 1000;
  let acknowledged = Array(test.count).fill(null);
  let version = 0,
    ticks = 0;
  started.add(1, { session: String(id) });
  while (Date.now() < until) {
    const answered = Math.min(
      test.count,
      Math.max(1, Math.ceil(((Date.now() - began + 1000) / (until - began)) * test.count))
    );
    for (let i = 0; i < answered; i++) answers[i] = answer(i, id);
    const saved = request(fixture, 'attempts/draft', { ...session, answers, version: ++version });
    check(saved, { 'draft accepted': (r) => r.ok && r.value.draftVersion >= version });
    if (saved.ok) acknowledged = [...answers];
    if (id % 5 === 0 && ticks % 4 === 0) {
      const resumed = request(fixture, 'attempts/resume', session);
      check(resumed, {
        'refresh restores latest answers': (r) =>
          r.ok &&
          r.value.draftVersion >= version &&
          JSON.stringify(r.value.answers) === JSON.stringify(answers),
      });
    }
    if (id % 10 === 0 && ticks % 6 === 0 && version > 1) {
      const stale = request(fixture, 'attempts/draft', {
        ...session,
        answers: Array(test.count).fill(null),
        version: version - 1,
      });
      check(stale, { 'stale version ignored': (r) => r.ok && r.value.draftVersion >= version });
    }
    ticks++;
    sleep(Math.min(Number(__ENV.THINK_SECONDS || 15), Math.max(0, (until - Date.now()) / 1000)));
  }
  for (let i = 0; i < test.count; i++) answers[i] = answer(i, id);
  sleep((((id - 1) % count) * submitWindow) / count);
  const final = request(fixture, 'attempts/draft', { ...session, answers, version: ++version });
  check(final, { 'final draft accepted': (r) => r.ok });
  if (final.ok) acknowledged = [...answers];
  if (Date.now() - began >= hold * 1000) held.add(1);
  const submitted = request(fixture, 'submit', { ...session, answers });
  const expectedAnswers = submitted.value.timedOut ? acknowledged : answers;
  const score = expectedAnswers.filter((a, i) => a === i % 4).length;
  expectation.add(1, {
    session: String(id),
    digest: sha256(JSON.stringify(expectedAnswers), 'hex'),
    score: String(score),
  });
  if (
    check(submitted, {
      'submission score correct': (r) => r.ok && r.value.total === test.count && r.value.score === score,
    })
  )
    completed.add(1, { session: String(id) });
  if (id % 10 === 0) {
    const again = request(fixture, 'submit', { ...session, answers: Array(test.count).fill(null) });
    check(again, { 'retry returns same result': (r) => r.ok && r.value.score === score });
  }
  ended.add(1, { session: String(id) });
}
export function teacher() {
  for (const school of fixture.schools) {
    const result = request(fixture, 'admin/results', null, school.token);
    check(result, {
      'teacher sees only own school': (r) =>
        r.ok && r.value.every((row) => Object.values(school.tests).some((t) => t.id === row.testId)),
    });
  }
  sleep(30);
}
export function handleSummary(data) {
  return {
    [__ENV.SUMMARY_PATH || '.local/load/summary.json']: JSON.stringify(
      {
        run,
        deadlineMode,
        kind,
        count,
        hold,
        window,
        warmup,
        submitWindow,
        environment: fixture.environment,
        baseUrl: target,
        summary: data,
      },
      null,
      2
    ),
  };
}
