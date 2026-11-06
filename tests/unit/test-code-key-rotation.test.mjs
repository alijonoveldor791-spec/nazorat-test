// №19: registry lookup mustaqilligi va legacy/v2 AES oldingi key mosligini tekshiradi.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, hkdfSync } from 'node:crypto';
import { secretEnvironment } from '../helpers/secret-env.mjs';
import { codeDigest, codeKeyId, encryptTestCode, decryptTestCode } from '../../server/lib/test-code.mjs';

test('lookup identity and digest survive independent attempt-key rotation', (t) => {
  const { current } = secretEnvironment(t);
  process.env.TEST_CODE_LOOKUP_KEY = current.TOKEN_SECRET;
  const oldKey = Buffer.from(
    hkdfSync('sha256', current.TOKEN_SECRET, '', 'nazorat-test-code-v1-identity', 32)
  );
  assert.equal(
    codeKeyId(),
    createHmac('sha256', oldKey).update('test-code-registry').digest('hex').slice(0, 24)
  );
  const digest = codeDigest('school-a', '001234'),
    id = codeKeyId();
  process.env.TOKEN_SECRET = current.TOKEN_SECRET + '-rotated';
  assert.equal(codeKeyId(), id);
  assert.equal(codeDigest('school-a', '001234'), digest);
  assert.notEqual(codeDigest('school-b', '001234'), digest);
});

test('v2 encryption rotation requires explicit previous key and preserves tenant AAD', (t) => {
  const { current } = secretEnvironment(t);
  const encrypted = encryptTestCode('school-a', 'test-a', '001234');
  assert.equal(encrypted.keyVersion, 2);
  process.env.TEST_CODE_ENCRYPTION_KEY = current.TEST_CODE_ENCRYPTION_KEY + '-rotated';
  assert.throws(
    () => decryptTestCode('school-a', 'test-a', encrypted),
    (e) => e.status === 503
  );
  process.env.TEST_CODE_ENCRYPTION_KEY_PREVIOUS = current.TEST_CODE_ENCRYPTION_KEY;
  assert.equal(decryptTestCode('school-a', 'test-a', encrypted), '001234');
  assert.throws(
    () => decryptTestCode('school-b', 'test-a', encrypted),
    (e) => e.status === 503
  );
  assert.throws(
    () => decryptTestCode('school-a', 'test-b', encrypted),
    (e) => e.status === 503
  );
});

test('legacy v1 decrypt in production requires explicit previous encryption key', (t) => {
  const { current, reset } = secretEnvironment(t);
  process.env.NETLIFY_DEV = 'true';
  process.env.ALLOW_LEGACY_SECRET_FALLBACK = 'true';
  delete process.env.TEST_CODE_ENCRYPTION_KEY;
  const encrypted = encryptTestCode('school-a', 'test-a', '001234');
  assert.equal(encrypted.keyVersion, 1);
  reset();
  assert.throws(
    () => decryptTestCode('school-a', 'test-a', encrypted),
    (e) => e.status === 503
  );
  process.env.TEST_CODE_ENCRYPTION_KEY_PREVIOUS = current.TOKEN_SECRET;
  assert.equal(decryptTestCode('school-a', 'test-a', encrypted), '001234');
  const old = { ...encrypted };
  delete old.keyId;
  delete old.keyVersion;
  assert.equal(decryptTestCode('school-a', 'test-a', old), '001234');
});
