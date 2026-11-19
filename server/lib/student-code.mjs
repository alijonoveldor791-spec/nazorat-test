// O'quvchi kodlari faqat admin ro'yxatida turadi; ochiq APIga chiqarilmaydi.
import { randomBytes, timingSafeEqual, createHash } from 'node:crypto';
export const normalizeCode = (value) =>
  typeof value === 'string' ? value.replace(/[\s-]/g, '').toUpperCase() : '';
export const newStudentCode = () => randomBytes(8).toString('hex').toUpperCase();
export const validStudentCode = (value) => /^[A-F0-9]{16}$/.test(normalizeCode(value));
export function codeMatches(input, stored) {
  if (!validStudentCode(input) || !validStudentCode(stored)) return false;
  const digest = (value) => createHash('sha256').update(normalizeCode(value)).digest();
  return timingSafeEqual(digest(input), digest(stored));
}
