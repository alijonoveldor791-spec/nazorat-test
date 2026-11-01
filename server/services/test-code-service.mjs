// Faqat o'z maktabi adminiga umumiy kodni ko'rsatadi va hayot siklini boshqaradi.
import * as codes from '../repositories/test-codes-repo.mjs';
import * as tests from '../repositories/tests-repo.mjs';
import { currentAccess, requireRole } from '../lib/access-context.mjs';
import { allocateCode, transitionCode } from '../lib/test-code-policy.mjs';
import { decryptTestCode, codeKeyId } from '../lib/test-code.mjs';
import { fail } from '../lib/http.mjs';
import { limit } from '../lib/rate-limit.mjs';
function schoolContext(test) {
  const auth = currentAccess();
  requireRole(auth, ['school_admin']);
  if (!auth.schoolId || test.schoolId !== auth.schoolId) fail('Test topilmadi.', 404);
  return auth.schoolId;
}
const emptyRegistry = (schoolId) => ({ schoolId, schema: 1, keyId: codeKeyId(), tests: {}, reserved: {} });
function requireRegistryKey(row) {
  if (row && row.keyId !== codeKeyId())
    fail("Test kodlari kaliti o'zgargan. Avvalgi server kalitini tiklang.", 503);
  return row;
}
function view(test, record) {
  return {
    value: decryptTestCode(test.schoolId, test.id, record.encrypted),
    state: record.state,
    version: record.version,
  };
}
export async function testCodeFor(test) {
  if (!test.schoolId || currentAccess()?.role !== 'school_admin') return undefined;
  const schoolId = schoolContext(test),
    existing = requireRegistryKey(await codes.find(schoolId));
  if (existing?.tests[test.id]) return view(test, existing.tests[test.id]);
  const registry = await codes.update(schoolId, (old) => {
    const row = requireRegistryKey(old) || emptyRegistry(schoolId);
    if (!row.tests[test.id]) row.tests[test.id] = allocateCode(row, schoolId, test.id);
    return row;
  });
  return view(test, registry.tests[test.id]);
}
export async function changeTestCode(id, d, ip) {
  requireRole(currentAccess(), ['school_admin']);
  const test = await tests.find(id);
  if (!test) fail('Test topilmadi.', 404);
  const schoolId = schoolContext(test);
  await limit('test-code-admin', schoolId + '|' + ip, 60);
  if (!['activate', 'revoke', 'replace'].includes(d.action)) fail("Kod amali noto'g'ri.");
  const registry = await codes.update(schoolId, (old) => {
    const row = requireRegistryKey(old) || emptyRegistry(schoolId),
      record = row.tests[id];
    if (!record) fail('Kod topilmadi. Testni qayta oching.', 409);
    if (d.action === 'replace') {
      if (record.state !== 'revoked' || record.version !== d.version)
        fail('Avval joriy kodni bekor qiling yoki sahifani yangilang.', 409);
      row.tests[id] = { ...allocateCode(row, schoolId, id), version: record.version + 1 };
    } else row.tests[id] = transitionCode(record, d.action, d.version);
    return row;
  });
  return { testId: id, testCode: view(test, registry.tests[id]) };
}
