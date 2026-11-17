// Qoralamani mavjud auditoriya, vaqt va test kodi oqimi orqali onlayn beradi.
import { findTest } from './test-service.mjs';
import { assignTest } from './test-assignment-service.mjs';
import * as tests from '../repositories/tests-repo.mjs';
import { requireOrigin } from './bank-policy-service.mjs';
import { settingsValid, scheduleValid } from '../lib/validate.mjs';
import { testCodeFor, changeTestCode } from './test-code-service.mjs';
import { fail } from '../lib/http.mjs';
export async function publishLibrary(id, input) {
  const test = await findTest(id);
  await requireOrigin(test, 'online');
  const settings = settingsValid(input.settings),
    schedule = scheduleValid(input.schedule);
  if (test.origin?.type === 'shared' && settings.showAnswers)
    fail('Umumiy testda javoblarni ochish mumkin emas.', 403);
  await assignTest(id, input);
  const row = await tests.update(id, (old) => ({ ...old, active: true, settings, schedule }));
  let testCode = await testCodeFor(row);
  if (testCode.state === 'revoked') {
    ({ testCode } = await changeTestCode(id, { action: 'replace', version: testCode.version }, 'library'));
  }
  if (testCode.state !== 'active') {
    ({ testCode } = await changeTestCode(id, { action: 'activate', version: testCode.version }, 'library'));
  }
  return { id, testCode };
}
