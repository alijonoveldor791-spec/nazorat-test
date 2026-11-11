// Faqat alohida muhitda sun'iy maktab, auditoriya va ikki xil testni tayyorlaydi.
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { loadTarget, client } from './target.mjs';
import { fixtureQuestions } from './rich-fixture.mjs';
const target = loadTarget(process.env.LOAD_BASE_URL || 'http://127.0.0.1:8899');
const count = Number(process.env.LOAD_SCHOOLS || 1);
if (!Number.isInteger(count) || count < 1 || count > 5) throw Error('LOAD_SCHOOLS: 1-5.');
if (!process.env.LOAD_ROOT_LOGIN || !process.env.LOAD_ROOT_PASSWORD)
  throw Error('LOAD_ROOT_LOGIN/PASSWORD kerak.');
const login = await client(target.baseUrl)('admin/login', {
  login: process.env.LOAD_ROOT_LOGIN,
  password: process.env.LOAD_ROOT_PASSWORD,
});
const root = client(target.baseUrl, login.token),
  run = Date.now().toString(36),
  schools = [];
for (let i = 0; i < count; i++) {
  const school = await root('super-admin/schools', {
    name: `LOAD ONLY ${run} ${i}`,
    region: 'Suniy sinov',
    requestId: randomUUID(),
  });
  const account = { login: `load-${run}-${i}`, password: randomUUID() };
  await root(`super-admin/schools/${school.id}/admin`, account);
  const session = await client(target.baseUrl)('admin/login', account),
    admin = client(target.baseUrl, session.token);
  const cls = await admin('admin/classes', { name: 'LOAD 11-A', roster: '' });
  const group = await admin('admin/classes', {
    name: 'LOAD guruh',
    kind: 'group',
    direction: 'Aniq fanlar',
    roster: '',
  });
  const tests = {};
  for (const kind of ['ordinary', 'block']) {
    const questions = fixtureQuestions(kind);
    const test = await admin('admin/tests', {
      title: `LOAD ${run} ${kind}`,
      testType: kind,
      subject: 'Sinov',
      direction: 'Aniq fanlar',
      classIds: [cls.id, group.id],
      questions,
      settings: { maxAttempts: 1, timeLimitMin: 0 },
      schedule: process.env.LOAD_DEADLINE_SECONDS
        ? { end: new Date(Date.now() + Number(process.env.LOAD_DEADLINE_SECONDS) * 1000).toISOString() }
        : {},
    });
    await admin(`admin/tests/${test.id}/code`, { action: 'activate', version: test.testCode.version });
    tests[kind] = {
      id: test.id,
      code: test.testCode.value,
      count: questions.length,
      scheduleEnd: test.schedule.end,
      questionBytes: Buffer.byteLength(JSON.stringify(questions)),
    };
  }
  schools.push({
    id: school.id,
    publicId: school.public_school_id,
    token: session.token,
    classIds: [cls.id, group.id],
    tests,
  });
}
const path = resolve(process.env.LOAD_FIXTURE || '.local/load/fixture.json');
if (
  !path.includes(`${String.fromCharCode(92)}.local${String.fromCharCode(92)}`) &&
  !path.replaceAll('\\', '/').includes('/.local/')
)
  throw Error('Tokenli fixture faqat .local ichiga yozilsin.');
await mkdir(dirname(path), { recursive: true });
await writeFile(path, JSON.stringify({ ...target, run, schools }, null, 2));
console.log(
  JSON.stringify(
    {
      fixture: path,
      environment: target.environment,
      schools: schools.length,
      questionBytes: schools[0].tests,
    },
    null,
    2
  ).replace(/"code": "\d{6}"/g, '"code": "REDACTED"')
);
