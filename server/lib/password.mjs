// Moslikni saqlagan holda bloklamaydigan scrypt parol tekshiruvi.
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
const derive = promisify(scrypt);
const PARAMETERS = { N: 32768, r: 8, p: 3, maxmem: 64 * 1024 * 1024 };
export async function passwordHash(password, salt = randomBytes(16).toString('hex')) {
  const hash = await derive(password, salt, 64, PARAMETERS);
  return { salt, hash: hash.toString('hex'), params: { N: 32768, r: 8, p: 3 } };
}
export async function passwordMatches(password, record) {
  if (typeof password !== 'string' || password.length > 200 || !record?.hash || !record?.salt) return false;
  const params = record.params || { N: 16384, r: 8, p: 1 };
  const actual = await derive(password, record.salt, 64, { ...params, maxmem: 64 * 1024 * 1024 });
  const expected = Buffer.from(record.hash, 'hex');
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
