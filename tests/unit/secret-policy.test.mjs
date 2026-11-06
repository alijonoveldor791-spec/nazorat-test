// №19: production fail-closed, explicit fallback va oldingi kalit bypasssiz tekshiriladi.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { secretEnvironment } from '../helpers/secret-env.mjs';
import { validateSecurityConfiguration, adminSessionSecret } from '../../server/lib/secret-policy.mjs';
import { verifyAdminToken } from '../../server/lib/env.mjs';
import { sign } from '../../server/lib/auth-token.mjs';
import dailyBackup from '../../netlify/functions/daily-backup.mjs';

test('production rejects missing, short and whitespace keys and optional malformed previous keys', (t) => {
  const { current, reset } = secretEnvironment(t);
  validateSecurityConfiguration();
  for (const name of Object.keys(current))
    for (const value of [undefined, 'short', ' '.repeat(40)]) {
      reset();
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
      assert.throws(
        validateSecurityConfiguration,
        (e) => e.status === 503 && !Object.values(current).some((key) => e.message.includes(key))
      );
    }
  for (const name of ['ADMIN_SESSION_PREVIOUS_SECRET', 'TEST_CODE_ENCRYPTION_KEY_PREVIOUS']) {
    reset();
    process.env[name] = 'short';
    assert.throws(validateSecurityConfiguration, (e) => e.status === 503);
  }
});

test('every current purpose uses a distinct key by default', (t) => {
  const { current, reset } = secretEnvironment(t),
    names = Object.keys(current);
  for (let i = 0; i < names.length; i++)
    for (let j = i + 1; j < names.length; j++) {
      reset();
      process.env[names[j]] = current[names[i]];
      assert.throws(validateSecurityConfiguration, (e) => e.status === 503);
    }
});

test('TOKEN_SECRET fallback requires both local mode and exact opt-in', (t) => {
  secretEnvironment(t);
  for (const name of ['ADMIN_SESSION_SECRET', 'TEST_CODE_ENCRYPTION_KEY', 'TEST_CODE_LOOKUP_KEY'])
    delete process.env[name];
  process.env.ALLOW_LEGACY_SECRET_FALLBACK = 'true';
  assert.throws(validateSecurityConfiguration, (e) => e.status === 503);
  process.env.NETLIFY_DEV = 'true';
  validateSecurityConfiguration();
  assert.equal(adminSessionSecret(), process.env.TOKEN_SECRET);
  process.env.ALLOW_LEGACY_SECRET_FALLBACK = 'false';
  assert.throws(validateSecurityConfiguration, (e) => e.status === 503);
});

test('explicit lookup bridge allows only the documented lookup/attempt pair', (t) => {
  secretEnvironment(t);
  process.env.TEST_CODE_LOOKUP_KEY = process.env.TOKEN_SECRET;
  assert.throws(validateSecurityConfiguration, (e) => e.status === 503);
  process.env.ALLOW_LEGACY_LOOKUP_KEY = 'true';
  validateSecurityConfiguration();
  process.env.ADMIN_SESSION_SECRET = process.env.TOKEN_SECRET;
  assert.throws(validateSecurityConfiguration, (e) => e.status === 503);
});

test('previous admin signatures work without hiding missing current configuration or expiry', (t) => {
  const { current } = secretEnvironment(t);
  const claim = { role: 'admin', jti: 'synthetic', exp: Date.now() + 60000 };
  const token = sign(claim, current.ADMIN_SESSION_SECRET);
  process.env.ADMIN_SESSION_PREVIOUS_SECRET = current.ADMIN_SESSION_SECRET;
  delete process.env.ADMIN_SESSION_SECRET;
  assert.throws(
    () => verifyAdminToken(token),
    (e) => e.status === 503
  );
  process.env.ADMIN_SESSION_SECRET = current.ADMIN_SESSION_SECRET + '-rotated';
  assert.equal(verifyAdminToken(token).jti, claim.jti);
  assert.throws(
    () => verifyAdminToken(sign({ ...claim, exp: Date.now() - 1 }, current.ADMIN_SESSION_SECRET)),
    (e) => e.status === 401
  );
});

test('scheduled backup rejects invalid keys before touching any store', async (t) => {
  secretEnvironment(t);
  delete process.env.TEST_CODE_LOOKUP_KEY;
  await assert.rejects(dailyBackup(), (e) => e.status === 503);
});
