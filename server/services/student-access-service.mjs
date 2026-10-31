// Eski ro’yxatlar uchun shaxsiy kodlarni admin o’qishida xavfsiz to’ldiradi.
import { listClasses } from './class-service.mjs';
import * as classesRepo from '../repositories/classes-repo.mjs';
import { newStudentCode, validStudentCode } from '../lib/student-code.mjs';
export const withCodes = (students) =>
  students.map((student) => ({
    ...student,
    accessCode: validStudentCode(student.accessCode) ? student.accessCode : newStudentCode(),
  }));
export async function adminClasses() {
  const rows = await listClasses(true);
  for (const row of rows) {
    if (!row.students.some((student) => !validStudentCode(student.accessCode))) continue;
    const saved = await classesRepo.update(row.id, (current) => ({
      ...current,
      students: withCodes(current?.students || row.students),
    }));
    row.students = saved.students;
  }
  return rows;
}
