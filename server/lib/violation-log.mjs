// Backupdagi qoidabuzarlik metama'lumotini qat'iy tekshiradi.
import { fail } from './http.mjs';
import { integer, string } from './validate.mjs';
export function restoreViolations(raw) {
  const count = integer(raw.violationCount ?? 0, 'Qoidabuzarlik soni', 0, 20);
  const log = raw.violationLog ?? [];
  if (
    !Array.isArray(log) ||
    log.length !== count ||
    (raw.terminatedViolation !== undefined && typeof raw.terminatedViolation !== 'boolean')
  )
    fail('Qoidabuzarlik logi yaroqsiz.');
  return {
    violationCount: count,
    terminatedViolation: raw.terminatedViolation === true,
    violationLog: log.map((event) => {
      if (
        !['printscreen', 'shortcut', 'blur', 'visibility', 'fullscreen'].includes(event?.type) ||
        !Number.isFinite(Date.parse(event.at))
      )
        fail('Qoidabuzarlik hodisasi yaroqsiz.');
      return {
        id: string(event.id, 'Hodisa ID', 64),
        type: event.type,
        at: new Date(event.at).toISOString(),
        studentId: event.studentId == null ? null : string(event.studentId, 'ID', 100),
        identityKey: string(event.identityKey, 'Urinish egasi', 64),
      };
    }),
  };
}
