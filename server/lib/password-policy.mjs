// Standart siyosatni saqlab, muhitdagi aniq parol uzunligi tanlovini qo’llaydi.
import { env } from './env.mjs';
import { fail } from './http.mjs';
export function passwordMinimum() {
  const value = env('TEACHER_PASSWORD_MIN_LENGTH');
  if (!value) return 12;
  const minimum = Number(value);
  if (!Number.isInteger(minimum) || minimum < 5 || minimum > 200)
    fail('TEACHER_PASSWORD_MIN_LENGTH 5–200 oralig’ida bo’lsin.', 503);
  return minimum;
}
