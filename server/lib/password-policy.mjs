// Kirish va parol almashtirish uchun yagona 6–12 belgili qoida.
import { fail } from './http.mjs';
export const passwordMinimum = () => 6;
export const passwordMaximum = () => 128;
export function requirePassword(value, label = 'Parol', status = 400) {
  if (
    typeof value !== 'string' ||
    !value.trim() ||
    value.length < passwordMinimum() ||
    value.length > passwordMaximum()
  )
    fail(`${label} ${passwordMinimum()}–${passwordMaximum()} belgi bo'lsin.`, status);
  return value;
}
