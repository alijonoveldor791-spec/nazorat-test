// Parolning ikkala chegarasi, maxsus belgilar va xato holatlarini tekshiradi.
import test from 'node:test';
import assert from 'node:assert/strict';
import { passwordMinimum, passwordMaximum, requirePassword } from '../server/lib/password-policy.mjs';
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
test('Parol: 6 va 12 belgili chegaralar, harf/raqam/maxsus belgi qabul qilinadi', () => {
  assert.equal(passwordMinimum(), 6);
  assert.equal(passwordMaximum(), 12);
  for (const value of ['ab_123', 'Ab_123456789', 'xy_456789', '123456'])
    assert.equal(requirePassword(value), value);
});
test('Parol: 5, 13 belgi, bo’sh qiymat va noto’g’ri turlar rad etiladi', () => {
  for (const value of ['12345', '1234567890123', '', '      ', undefined, null, 123456, {}])
    assert.throws(
      () => requirePassword(value),
      (error) => error.status === 400 && /6–12/.test(error.message)
    );
});
test('Parol: bootstrap xatosi 503 va sozlama nomi bilan qaytadi', () => {
  assert.throws(
    () => requirePassword('12345', 'TEACHER_PASSWORD', 503),
    (error) => error.status === 503 && /TEACHER_PASSWORD 6–12/.test(error.message)
  );
});
test('Parol: eski muhit minimumi 6–12 qoidasini o’zgartirmaydi', () => {
  for (const value of [undefined, '5', '12', '200', 'abc'])
    configured(value, () => {
      assert.equal(passwordMinimum(), 6);
      assert.equal(passwordMaximum(), 12);
    });
});
