// Eski zaxiralarga mos ixtiyoriy mavzular maydonini ruxsat etilgan maydonlar bilan tiklaydi.
import { validId } from './backup-validate.mjs';
import { string, integer, questionsValid } from './validate.mjs';
import { fail } from './http.mjs';
export function restoreTopics(value = []) {
  if (!Array.isArray(value) || value.length > 1000) fail('Zaxirada 1000 tadan ortiq mavzu mumkin emas.');
  const rows = value.map((t) => {
    if (!Array.isArray(t.questions) || t.questions.length > 2000) fail('Mavzu savollari yaroqsiz.');
    const questions = t.questions.map((q) => ({
      ...questionsValid([q])[0],
      id: validId(q.id),
      archived: q.archived === true,
    }));
    if (new Set(questions.map((q) => q.id)).size !== questions.length)
      fail('Mavzu savol IDlari takrorlangan.');
    return {
      id: validId(t.id),
      grade: string(t.grade, 'Sinf', 60),
      subject: string(t.subject, 'Fan', 100),
      name: string(t.name, 'Mavzu', 160),
      quarter: integer(t.quarter, 'Chorak', 1, 4),
      version: integer(t.version, 'Mavzu versiyasi', 1, 1000000000),
      questions,
      ...Object.fromEntries(
        ['createdAt', 'updatedAt', 'lastUploadedAt']
          .filter((key) => t[key] != null)
          .map((key) => {
            if (typeof t[key] !== 'string' || !Number.isFinite(Date.parse(t[key])))
              fail('Mavzu sanasi yaroqsiz.');
            return [key, new Date(t[key]).toISOString()];
          })
      ),
    };
  });
  if (new Set(rows.map((t) => t.id)).size !== rows.length) fail('Mavzu IDlari takrorlangan.');
  return rows;
}
