// auth-token: muhim xatti-harakat regressiya sinovlari.
import test from 'node:test';
import assert from 'node:assert/strict';
import { sign, verify } from '../server/lib/auth-token.mjs';
import { passwordHash, passwordMatches } from '../server/lib/password.mjs';
test('HMAC: haqiqiy token, buzilgan imzo, muddat va rol', () => {
  const key = 'x'.repeat(48),
    token = sign({ role: 'admin', exp: 2000 }, key);
  assert.equal(verify(token, key, 'admin', 1000).role, 'admin');
  assert.throws(() => verify(token + 'x', key, 'admin', 1000));
  assert.throws(() => verify(token, key, 'admin', 3000));
  assert.throws(() => verify(token, key, 'attempt', 1000));
  assert.throws(() => verify(token, 'wrong', 'admin', 1000));
  assert.throws(() => verify('garbage', key, 'admin'));
});
test('Parol scrypt hash: haqiqiy va xato', () => {
  const h = passwordHash('yangi-maxfiy-parol');
  assert(passwordMatches('yangi-maxfiy-parol', h));
  assert(!passwordMatches('xato', h));
  assert(!passwordMatches(null, h));
});
