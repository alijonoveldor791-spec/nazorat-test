// Qisqa maktab IDsi va umumiy kodni serverda tekshiradi; ro'yxat va kalitni bermaydi.
import * as schools from '../repositories/schools-repo.mjs';
import * as ids from '../repositories/public-school-ids-repo.mjs';
import * as codes from '../repositories/test-codes-repo.mjs';
import * as tests from '../repositories/tests-repo.mjs';
import { assignedClasses } from './class-service.mjs';
import { normalizePublicSchoolId } from '../lib/public-school-id.mjs';
import { codeDigest, codeKeyId, requireTestCode } from '../lib/test-code.mjs';
import { runWithAccess } from '../lib/access-context.mjs';
import { fail } from '../lib/http.mjs';
import { limit, checkLimit } from '../lib/rate-limit.mjs';
import { requireAvailable } from './test-service.mjs';
import { startAttempt } from './attempt-service.mjs';
const reject = async (ip) => {
  await limit('school-entry-invalid', ip, 120);
  fail('Maktab IDsi yoki test kodi mos emas, yoxud test hozir ochiq emas.', 403);
};
async function withEntry(payload, ip, action) {
  await checkLimit('school-entry-invalid', ip, 120);
  let code;
  try {
    code = normalizePublicSchoolId(payload.public_school_id);
    requireTestCode(payload.testCode);
  } catch (error) {
    await limit('school-entry-invalid', ip, 120);
    throw error;
  }
  const hasBrowser =
    typeof payload.browserKey === 'string' && /^[a-f0-9-]{32,100}$/i.test(payload.browserKey);
  await limit(
    'school-entry-client',
    ip + '|' + (hasBrowser ? payload.browserKey : 'legacy'),
    hasBrowser ? 30 : 6000
  );
  const schoolId = await ids.schoolIdFor(code);
  const school = schoolId ? await schools.find(schoolId) : null;
  if (!school || school.public_school_id !== code || (school.status || 'active') !== 'active')
    return reject(ip);
  return runWithAccess({ role: 'school_student', schoolId }, async () => {
    const registry = await codes.find(schoolId);
    if (!registry || registry.keyId !== codeKeyId()) return reject(ip);
    const testId = registry.reserved[codeDigest(schoolId, payload.testCode)];
    const record = testId ? registry.tests[testId] : null;
    if (!record || record.state !== 'active' || record.digest !== codeDigest(schoolId, payload.testCode))
      return reject(ip);
    const test = await tests.find(testId);
    if (!test) return reject(ip);
    try {
      requireAvailable(test);
    } catch {
      return reject(ip);
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
    classes: (await assignedClasses(test)).map((row) => ({
      id: row.id,
      name: row.name,
      kind: row.kind || 'class',
      direction: row.direction || '',
    })),
  }));
export const startSchoolEntry = (payload, ip) =>
  withEntry(payload, ip, (school, test) => startAttempt(test.id, payload, ip));
