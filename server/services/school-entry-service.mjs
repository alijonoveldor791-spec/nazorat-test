// Qisqa maktab IDsi va umumiy kodni serverda tekshiradi; ro'yxat va kalitni bermaydi.
import * as schools from '../repositories/schools-repo.mjs';
import * as ids from '../repositories/public-school-ids-repo.mjs';
import * as codes from '../repositories/test-codes-repo.mjs';
import * as tests from '../repositories/tests-repo.mjs';
import * as classes from '../repositories/classes-repo.mjs';
import { normalizePublicSchoolId } from '../lib/public-school-id.mjs';
import { codeDigest, codeKeyId, requireTestCode } from '../lib/test-code.mjs';
import { runWithAccess } from '../lib/access-context.mjs';
import { fail } from '../lib/http.mjs';
import { limit } from '../lib/rate-limit.mjs';
import { requireAvailable } from './test-service.mjs';
import { startAttempt } from './attempt-service.mjs';
const reject = () =>
  fail(
    "Maktab IDsi yoki test kodi mos emas, yoxud test hozir ochiq emas. O'qituvchi test va uning umumiy kodi faolligini tekshirsin.",
    403
  );
async function withEntry(payload, ip, action) {
  await limit('school-entry-ip', ip, 480, 60000);
  const code = normalizePublicSchoolId(payload.public_school_id);
  requireTestCode(payload.testCode);
  await limit('school-entry-pair', ip + '|' + code, 240, 60000);
  const schoolId = await ids.schoolIdFor(code);
  const school = schoolId ? await schools.find(schoolId) : null;
  if (!school || school.public_school_id !== code || (school.status || 'active') !== 'active') reject();
  return runWithAccess({ role: 'school_student', schoolId }, async () => {
    const registry = await codes.find(schoolId);
    if (!registry || registry.keyId !== codeKeyId()) reject();
    const testId = registry.reserved[codeDigest(schoolId, payload.testCode)];
    const record = testId ? registry.tests[testId] : null;
    if (!record || record.state !== 'active' || record.digest !== codeDigest(schoolId, payload.testCode))
      reject();
    const test = await tests.find(testId);
    if (!test) reject();
    try {
      requireAvailable(test);
    } catch {
      reject();
    }
    return action(school, test);
  });
}
export const resolveSchoolEntry = (payload, ip) =>
  withEntry(payload, ip, async (school, test) => ({
    school: { public_school_id: school.public_school_id, name: school.name },
    test: {
      id: test.id,
      title: test.title,
      count: test.questions.length,
      settings: { timeLimitMin: test.settings.timeLimitMin, maxAttempts: test.settings.maxAttempts },
    },
    classes: (await classes.list(true))
      .filter((row) => test.classIds.includes(row.id))
      .map((row) => ({ id: row.id, name: row.name })),
  }));
export const startSchoolEntry = (payload, ip) =>
  withEntry(payload, ip, (school, test) => startAttempt(test.id, payload, ip));
