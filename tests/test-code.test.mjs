// Olti raqam, boshlang'ich nol, shifrlash va kod holati qoidalarini tekshiradi.
import test from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import {
  generateTestCode,
  requireTestCode,
  encryptTestCode,
  decryptTestCode,
  codeDigest,
} from '../server/lib/test-code.mjs';
import { allocateCode, transitionCode } from '../server/lib/test-code-policy.mjs';
import { restoreTest } from '../server/lib/backup-validate.mjs';
process.env.TOKEN_SECRET = randomBytes(40).toString('hex');
test('Kod: generator aniq 6 ta ASCII raqam beradi', () => {
  for (let index = 0; index < 1000; index++) assert.match(generateTestCode(), /^[0-9]{6}$/);
});
test('Kod: boshidagi nol saqlanadi, son va boshqa formatlar rad', () => {
  assert.equal(requireTestCode('004271'), '004271');
  for (const code of [
    4271,
    123456,
    null,
    '',
    '12345',
    '1234567',
    '123 45',
    '12-456',
    'abcdef',
    '１２３４５６',
  ])
    assert.throws(() => requireTestCode(code));
});
test('Kod: shifrlangan saqlash va maktab/testga bog‘langan autentifikatsiya', () => {
  const encrypted = encryptTestCode('school-a', 'test-a', '004271');
  assert(!JSON.stringify(encrypted).includes('004271'));
  assert.equal(decryptTestCode('school-a', 'test-a', encrypted), '004271');
  assert.throws(() => decryptTestCode('school-b', 'test-a', encrypted));
  assert.throws(() => decryptTestCode('school-a', 'test-b', encrypted));
  assert.throws(() => decryptTestCode('school-a', 'test-a', { ...encrypted, tag: 'bad' }));
  assert.notEqual(codeDigest('school-a', '004271'), codeDigest('school-b', '004271'));
});
test('Kod: bir xil qiymat turli IV bilan turlicha shifrlanadi', () => {
  assert.notEqual(encryptTestCode('a', 't', '000000').data, encryptTestCode('a', 't', '000000').data);
});
test('Kod: to‘qnashuvda qayta nomzod olinadi, bekor qiymat qayta berilmaydi', () => {
  const registry = { tests: {}, reserved: {} };
  allocateCode(registry, 'a', 'one', () => '004271');
  let tries = 0;
  const next = allocateCode(registry, 'a', 'two', () => (tries++ ? '000001' : '004271'));
  assert.equal(decryptTestCode('a', 'two', next.encrypted), '000001');
  assert.throws(() => allocateCode(registry, 'a', 'three', () => '004271'));
});
test('Kod: faollashtirish/bekor qilish va eski versiya himoyasi', () => {
  const inactive = { state: 'inactive', version: 1 };
  const active = transitionCode(inactive, 'activate', 1);
  assert.equal(active.state, 'active');
  assert.throws(() => transitionCode(active, 'revoke', 1));
  const revoked = transitionCode(active, 'revoke', active.version);
  assert.equal(revoked.state, 'revoked');
  assert.throws(() => transitionCode(revoked, 'activate', revoked.version));
  assert.throws(() => transitionCode(inactive, 'unknown', 1));
});
test('Test: eski zaxira mosligi va yangi fan maydoni tiklanadi', () => {
  const raw = {
    id: 'one',
    title: 'Test',
    subject: 'Matematika',
    active: true,
    grades: [],
    classIds: ['c'],
    questions: [{ q: 'Q', options: ['a', 'b'], answer: 0 }],
  };
  const classes = new Map([['c', { id: 'c', name: '7-A' }]]);
  assert.equal(restoreTest(raw, classes).subject, 'Matematika');
  delete raw.subject;
  assert.equal(restoreTest(raw, classes).subject, undefined);
});
