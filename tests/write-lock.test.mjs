// Repository navbati yo’qolgan yangilanish va yopishib qolishni oldini oladi.
import test from 'node:test';
import assert from 'node:assert/strict';
import { withKeyLock } from '../server/repositories/write-lock.mjs';

test('Yozish navbati: bir kalitdagi parallel yangilanishlar yo’qolmaydi', async () => {
  let count = 0;
  await Promise.all(
    Array.from({ length: 20 }, () =>
      withKeyLock('same-key', async () => {
        const before = count;
        await Promise.resolve();
        count = before + 1;
      })
    )
  );
  assert.equal(count, 20);
});
test('Yozish navbati: xato keyingi amalni to’smaydi', async () => {
  const outcomes = await Promise.allSettled([
    withKeyLock('failure-key', async () => {
      throw new Error('fail');
    }),
    withKeyLock('failure-key', async () => 42),
  ]);
  assert.equal(outcomes[0].status, 'rejected');
  assert.equal(outcomes[1].value, 42);
});
test('Yozish navbati: boshqa kalitlar birga ishlaydi', async () => {
  let active = 0,
    maximum = 0;
  await Promise.all(
    ['first', 'second'].map((key) =>
      withKeyLock(key, async () => {
        active++;
        maximum = Math.max(maximum, active);
        await Promise.resolve();
        active--;
      })
    )
  );
  assert.equal(maximum, 2);
});
