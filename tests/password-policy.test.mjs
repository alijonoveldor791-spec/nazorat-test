// Muhit uchun alohida minimum umumiy standartni o’zgartirmasligini tekshiradi.
import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordMinimum } from '../server/lib/password-policy.mjs';
function configured(value, check) {
  const previous = process.env.TEACHER_PASSWORD_MIN_LENGTH;
  if (value === undefined) delete process.env.TEACHER_PASSWORD_MIN_LENGTH;
  else process.env.TEACHER_PASSWORD_MIN_LENGTH = value;
  try {
    check();
  } finally {
    if (previous === undefined) delete process.env.TEACHER_PASSWORD_MIN_LENGTH;
    else process.env.TEACHER_PASSWORD_MIN_LENGTH = previous;
  }
}
test('Parol minimumi: standart 12', () => configured(undefined, () => assert.equal(passwordMinimum(), 12)));
test('Parol minimumi: foydalanuvchi muhiti uchun 5', () =>
  configured('5', () => assert.equal(passwordMinimum(), 5)));
test('Parol minimumi: noto’g’ri sozlama rad etiladi', () => {
  for (const value of ['4', '201', 'abc', '5.5'])
    configured(value, () =>
      assert.throws(
        () => passwordMinimum(),
        (e) => e.status === 503
      )
    );
});
