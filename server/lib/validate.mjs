// lib/validate.mjs: serverdagi shu qatlam vazifasi.
import { randomUUID } from 'node:crypto';
import { fail } from './http.mjs';
import { norm } from './identity.mjs';
export function string(value, label, max = 100, required = true) {
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim()))
    fail(`${label}: matn kiriting (ko’pi bilan ${max} belgi).`);
  return value.trim();
}
export function integer(value, label, min, max) {
  if (!Number.isInteger(value) || value < min || value > max)
    fail(`${label}: ${min}–${max} oralig’ida butun son bo’lsin.`);
  return value;
}
export function object(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail('JSON obyekt kutilgan.');
  return value;
}
export function questionsValid(value) {
  if (!Array.isArray(value) || !value.length || value.length > 200) fail('1–200 ta savol kiriting.');
  return value.map((item, i) => {
    object(item);
    if (!Array.isArray(item.options) || item.options.length < 2 || item.options.length > 6)
      fail(`${i + 1}-savol: 2–6 ta variant kiriting.`);
    return {
      q: string(item.q, `${i + 1}-savol`, 2000),
      options: item.options.map((o) => string(o, 'Variant', 1000)),
      answer: integer(item.answer, 'To’g’ri javob', 0, item.options.length - 1),
    };
  });
}
export function settingsValid(value = {}) {
  object(value);
  for (const key of ['shuffleQuestions', 'shuffleOptions', 'showAnswers'])
    if (value[key] !== undefined && typeof value[key] !== 'boolean') fail(`${key}: mantiqiy qiymat kerak.`);
  return {
    timeLimitMin: integer(value.timeLimitMin ?? 0, 'Vaqt', 0, 240),
    maxAttempts: integer(value.maxAttempts ?? 1, 'Urinishlar', 1, 100),
    shuffleQuestions: !!value.shuffleQuestions,
    shuffleOptions: !!value.shuffleOptions,
    showAnswers: !!value.showAnswers,
  };
}
export function scheduleValid(value = {}) {
  object(value);
  const out = {};
  for (const key of ['start', 'end']) {
    const v = value[key];
    if (
      v !== null &&
      v !== undefined &&
      v !== '' &&
      (typeof v !== 'string' || !Number.isFinite(Date.parse(v)))
    )
      fail('Jadval vaqti noto’g’ri.');
    out[key] = v ? new Date(v).toISOString() : null;
  }
  if (out.start && out.end && out.start >= out.end) fail('Tugash boshlanishdan keyin bo’lsin.');
  return out;
}
export function classValid(d, old) {
  object(d);
  const name = string(d.name, 'Sinf nomi', 60);
  let students = [];
  if (d.roster !== undefined) {
    const roster = string(d.roster, 'Ro’yxat', 60000, false);
    students = roster
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((line) => {
        const [surname, ...rest] = line.split(/\s+/);
        if (!rest.length) fail('Har qatorda Familiya Ism kiriting.');
        const name = string(rest.join(' '), 'Ism', 60);
        string(surname, 'Familiya', 60);
        const existing = old?.students?.find(
          (s) => norm(s.name + ' ' + s.surname) === norm(name + ' ' + surname)
        );
        return { id: existing?.id || randomUUID(), name, surname };
      });
  } else if (d.students !== undefined) {
    if (!Array.isArray(d.students)) fail('O’quvchilar ro’yxati kerak.');
    students = d.students.map((s) => ({
      id: s.id ? string(s.id, 'O’quvchi ID', 100) : randomUUID(),
      name: string(s.name, 'Ism', 60),
      surname: string(s.surname, 'Familiya', 60),
    }));
  } else students = old?.students || [];
  if (students.length > 500) fail('Sinfda ko’pi bilan 500 o’quvchi.');
  if (
    new Set(students.map((s) => norm(s.surname + ' ' + s.name))).size !== students.length ||
    new Set(students.map((s) => s.id)).size !== students.length
  )
    fail('O’quvchilar takrorlanmasin.');
  return { id: old?.id || randomUUID(), name, students };
}
