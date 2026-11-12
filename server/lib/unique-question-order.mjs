// Tartib raqamini takrorlanmaydigan, aralashtirilgan qisman permutatsiyaga aylantiradi.
import { createHash } from 'node:crypto';
import { fail } from './http.mjs';
export function permutationCount(size, take) {
  let total = 1n;
  for (let i = 0; i < take; i++) total *= BigInt(size - i);
  return total;
}
function gcd(a, b) {
  while (b) [a, b] = [b, a % b];
  return a;
}
export function uniqueQuestionOrder(size, take, ordinal, seed) {
  const total = permutationCount(size, take);
  if (ordinal < 0n || ordinal >= total)
    fail('Yangi ketma-ketlik qolmadi. Savollar bazasini kengaytiring.', 409);
  const bytes = Math.ceil(total.toString(16).length / 2);
  const derive = (label) =>
    BigInt(
      '0x' +
        createHash('shake256', { outputLength: bytes })
          .update(seed + ':' + label)
          .digest('hex')
    ) % total;
  let step = derive('step') || 1n;
  while (gcd(step, total) !== 1n) step++;
  let rank = (derive('offset') + ordinal * step) % total;
  const available = Array.from({ length: size }, (_, i) => i),
    order = [];
  let block = permutationCount(size - 1, take - 1);
  for (let i = 0; i < take; i++) {
    const index = Number(rank / block);
    rank %= block;
    order.push(available.splice(index, 1)[0]);
    if (i + 1 < take) block /= BigInt(size - i - 1);
  }
  return order;
}
