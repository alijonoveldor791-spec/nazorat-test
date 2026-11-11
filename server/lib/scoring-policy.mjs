// DTM tarkibini tekshiradi va bo'lim IDlariga butun koeffitsiyent snapshotini bog'laydi.
import { fail } from './http.mjs';
function sectionKind(type) {
  const text = type.toLowerCase().replace(/\s+/g, ' ').trim();
  if (/^1\s*-\s*mutaxassislik(?: fani)?$/.test(text)) return 'first';
  if (/^2\s*-\s*mutaxassislik(?: fani)?$/.test(text)) return 'second';
  if (/^majburiy(?: fan| fanlar)?$/.test(text)) return 'required';
  return null;
}
export function scoringPolicy(questions, mode = 'normal', testType = 'block') {
  if (mode !== 'dtm') return { mode: 'normal' };
  if (testType !== 'block') fail('DTM baholash uchun Blok test turini tanlang.');
  const sections = new Map(),
    errors = [];
  for (const q of questions) {
    if (!q.section) {
      errors.push("Bo'limsiz savol mavjud.");
      continue;
    }
    const row = sections.get(q.section.id) || { ...q.section, count: 0 };
    if (row.type !== q.section.type || row.subject !== q.section.subject)
      errors.push(row.id + ": bo'lim ma'lumotlari mos emas.");
    row.count++;
    sections.set(row.id, row);
  }
  const groups = { first: [], second: [], required: [] };
  for (const row of sections.values()) {
    const kind = sectionKind(row.type);
    if (!kind) {
      errors.push(row.type + ": bo'lim turi tanilmadi.");
      continue;
    }
    groups[kind].push(row);
    row.coefficientUnits = kind === 'first' ? 31 : kind === 'second' ? 21 : 11;
    const expected = kind === 'required' ? 10 : 30;
    if (row.count !== expected)
      errors.push(
        row.type +
          ' / ' +
          row.subject +
          ': ' +
          Math.abs(expected - row.count) +
          (row.count < expected ? ' ta savol yetishmaydi.' : ' ta savol ortiqcha.')
      );
  }
  for (const [kind, label, expected] of [
    ['first', '1-mutaxassislik fani', 1],
    ['second', '2-mutaxassislik fani', 1],
    ['required', 'Majburiy fanlar', 3],
  ]) {
    const count = groups[kind].length;
    if (count !== expected)
      errors.push(
        label +
          ': ' +
          Math.abs(expected - count) +
          (count < expected ? " ta bo'lim yetishmaydi" : " ta bo'lim ortiqcha") +
          (count < expected
            ? ' (' + (expected - count) * (kind === 'required' ? 10 : 30) + ' ta savol).'
            : '.')
      );
  }
  if (questions.length !== 90) errors.push('Jami ' + questions.length + ' ta savol; 90 ta kerak.');
  if (errors.length) fail(errors.join(' '));
  return {
    mode: 'dtm',
    version: 1,
    scale: 10,
    maxScore: 189,
    sections: [...sections.values()].map(({ count, ...row }) => ({
      ...row,
      total: count,
      maxScore: (count * row.coefficientUnits) / 10,
    })),
  };
}
export function coefficientFor(policy, section) {
  const row = policy.sections?.find((s) => s.id === section?.id);
  if (!row) fail("DTM urinishida bo'lim koeffitsiyenti topilmadi.");
  return row.coefficientUnits;
}
