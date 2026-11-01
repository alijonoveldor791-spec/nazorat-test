// Qisqa maktab ID formati va atomik rezervning sof qoidalari.
import { fail } from './http.mjs';
export function normalizePublicSchoolId(value) {
  const code = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (!/^SK-[1-9][0-9]{3,15}$/.test(code) || !Number.isSafeInteger(Number(code.slice(3))))
    fail("Maktab IDsi SK-1001 ko'rinishida bo'lishi kerak.");
  return code;
}
export function reservePublicSchoolIds(previous, existing, targets = []) {
  const row = {
    schema: 1,
    last: previous?.last ?? 1000,
    bySchool: Object.assign(Object.create(null), previous?.bySchool),
    byPublic: Object.assign(Object.create(null), previous?.byPublic),
  };
  if (!Number.isSafeInteger(row.last) || row.last < 1000) fail('Maktab ID hisoblagichi yaroqsiz.', 409);
  for (const school of existing) {
    if (!school.public_school_id) continue;
    const code = normalizePublicSchoolId(school.public_school_id);
    if (code !== school.public_school_id) fail('Mavjud maktab IDsi kanonik emas.', 409);
    if (
      (row.byPublic[code] && row.byPublic[code] !== school.id) ||
      (row.bySchool[school.id] && row.bySchool[school.id] !== code)
    )
      fail("Maktab ID rezervida ziddiyat bor. Migratsiya to'xtatildi.", 409);
    row.bySchool[school.id] = code;
    row.byPublic[code] = school.id;
    row.last = Math.max(row.last, Number(code.slice(3)));
  }
  for (const id of targets) {
    if (row.bySchool[id]) continue;
    if (!Number.isSafeInteger(row.last + 1)) fail('Maktab ID raqamlari chegarasi tugadi.', 409);
    const code = 'SK-' + String(++row.last).padStart(4, '0');
    row.bySchool[id] = code;
    row.byPublic[code] = id;
  }
  return row;
}
