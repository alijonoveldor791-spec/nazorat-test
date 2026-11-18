// Tanlangan testdagi davom etayotgan va ro'yxatdagi boshlamagan o'quvchilarni aniqlaydi.
import * as attempts from '../repositories/attempts-repo.mjs';
import * as tests from '../repositories/tests-repo.mjs';
import { listClasses } from './class-service.mjs';
import { needsParticipation } from '../lib/result-filters.mjs';
import { norm } from '../lib/identity.mjs';
import { fail } from '../lib/http.mjs';

const personKeys = (row) =>
  [
    row.studentId ? JSON.stringify([row.classId, 'id', row.studentId]) : null,
    JSON.stringify([row.classId, 'name', norm(`${row.surname || ''} ${row.name || ''}`)]),
  ].filter(Boolean);
const hasPerson = (set, row) => personKeys(row).some((key) => set.has(key));
const addPerson = (set, row) => personKeys(row).forEach((key) => set.add(key));

export async function withParticipation(rows, params) {
  if (!needsParticipation(params.get('status'))) return { rows, notice: '' };
  const testId = params.get('testId');
  if (!testId) fail("Bu holatni ko'rish uchun avval testni tanlang.", 400);
  const test = await tests.find(testId);
  if (!test) fail("Test topilmadi yoki unga ruxsat yo'q.", 404);
  const classId = params.get('classId') || '';
  const classes = (await listClasses()).filter(
    (cls) => (test.classIds || []).includes(cls.id) && (!classId || cls.id === classId)
  );
  const completed = new Set();
  const seen = new Set();
  for (const row of rows.filter((row) => row.testId === testId)) {
    addPerson(completed, row);
    addPerson(seen, row);
  }
  const extra = [];
  const pending = (await attempts.listPending()).filter((row) => row.testId === testId);
  for (let offset = 0; offset < pending.length; offset += 16) {
    const batch = await Promise.all(
      pending.slice(offset, offset + 16).map((row) => attempts.findState(row.id))
    );
    for (const attempt of batch.filter(Boolean)) {
      const who = attempt.identity;
      if (!who || attempt.finished || (classId && who.classId !== classId)) continue;
      const end = attempt.deadline ? Date.parse(attempt.deadline) : attempt.expires;
      if (end <= Date.now()) continue;
      const row = {
        id: `pending:${attempt.id}`,
        testId,
        testTitle: test.title,
        classId: who.classId,
        grade: who.grade,
        studentId: who.studentId,
        surname: who.surname,
        name: who.name,
        time: attempt.started,
        hasResult: false,
        submissionStatus: 'in-progress',
        score: null,
        total: null,
        violationCount: attempt.violationCount || 0,
        hasPreviousResult: hasPerson(completed, who),
      };
      extra.push(row);
      addPerson(seen, row);
    }
  }
  for (const cls of classes) {
    for (const student of cls.students || []) {
      const who = { classId: cls.id, studentId: student.id, surname: student.surname, name: student.name };
      if (hasPerson(seen, who)) continue;
      extra.push({
        ...who,
        id: `absent:${JSON.stringify([testId, cls.id, student.id || norm(`${student.surname} ${student.name}`)])}`,
        testId,
        testTitle: test.title,
        grade: cls.name,
        time: null,
        hasResult: false,
        submissionStatus: 'not-started',
        score: null,
        total: null,
      });
      addPerson(seen, who);
    }
  }
  return {
    rows: [...rows, ...extra],
    notice: classes.some((cls) => !cls.students?.length)
      ? "Ro'yxati kiritilmagan sinf/guruhlarda boshlamaganlarni aniqlab bo'lmaydi."
      : "Boshlamaganlar tanlangan testga biriktirilgan joriy o'quvchilar ro'yxatidan olinadi.",
  };
}
