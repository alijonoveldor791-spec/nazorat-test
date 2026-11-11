// Sinflarni va eski grades yozuvlarining ko\'rinishini boshqaradi.
import * as classesRepo from '../repositories/classes-repo.mjs';
import * as testsRepo from '../repositories/tests-repo.mjs';
import { legacyClassId } from '../migrations/legacy.mjs';
import { norm } from '../lib/identity.mjs';
import { fail } from '../lib/http.mjs';
import { classValid } from '../lib/validate.mjs';
import { currentAccess } from '../lib/access-context.mjs';

export async function listClasses(fresh = false) {
  const [explicit, tests] = await Promise.all([classesRepo.list(fresh), testsRepo.list(fresh)]);
  const map = new Map(
    explicit.map((c) => [
      c.id,
      { ...c, kind: c.kind || 'class', direction: c.direction || '', students: c.students || [] },
    ])
  );
  for (const test of tests)
    for (const name of test.grades || []) {
      const id = legacyClassId(name);
      if (!map.has(id) && test.classIds.includes(id)) map.set(id, { id, name, students: [], legacy: true });
    }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'uz', { numeric: true }));
}

export async function saveClass(payload, id) {
  const classes = await listClasses(true);
  const old = id ? classes.find((c) => c.id === id) : null;
  if (id && !old) fail('Sinf topilmadi.', 404);
  const row = classValid(payload, old);
  const now = new Date().toISOString();
  row.createdAt = old ? old.createdAt : now;
  row.updatedAt = now;
  if (currentAccess()?.schoolId) row.schoolId = currentAccess().schoolId;
  if (
    classes.some(
      (c) =>
        c.id !== row.id &&
        norm(c.name) === norm(row.name) &&
        (c.kind || 'class') === row.kind &&
        norm(c.direction || '') === norm(row.direction)
    )
  )
    fail('Bu sinf yoki guruh nomi mavjud.');
  if (
    old &&
    ((old.kind || 'class') !== row.kind || (old.direction || '') !== row.direction) &&
    (await testsRepo.list(true)).some((t) => t.classIds.includes(row.id))
  )
    fail(
      "Biriktirilgan testlar bor. Tur yoki yo'nalishni o'zgartirishdan avval biriktirishlarni tahrirlang."
    );
  await classesRepo.save(row);
  if (old && old.name !== row.name)
    for (const test of await testsRepo.list(true)) {
      if (!test.classIds.includes(row.id)) continue;
      await testsRepo.save({
        ...test,
        grades: test.classIds.map((id) =>
          id === row.id ? row.name : classes.find((c) => c.id === id)?.name || id
        ),
      });
    }
  return row;
}

export async function deleteClass(id) {
  const classes = await listClasses(true);
  if (!classes.some((c) => c.id === id)) fail('Sinf topilmadi.', 404);
  for (const test of await testsRepo.list(true)) {
    if (!test.classIds.includes(id)) continue;
    const classIds = test.classIds.filter((key) => key !== id);
    await testsRepo.save({
      ...test,
      classIds,
      grades: classIds.map((id) => classes.find((c) => c.id === id)?.name || id),
    });
  }
  await classesRepo.remove(id);
  return { ok: true };
}

export async function publicClasses() {
  return (await listClasses()).map((c) => ({ id: c.id, name: c.name, hasRoster: !!c.students.length }));
}

export async function classStudents(id) {
  fail("O'quvchilar ro'yxati yopiq. O'qituvchi bergan shaxsiy koddan foydalaning.", 403);
}

export async function getClass(id) {
  if (typeof id !== 'string') return null;
  const row = await classesRepo.find(id);
  if (row) return { ...row, kind: row.kind || 'class', students: row.students || [] };
  return id.startsWith('legacy-') ? (await listClasses(true)).find((c) => c.id === id) || null : null;
}
export async function assignedClasses(test) {
  return (await Promise.all(test.classIds.map(getClass))).filter(Boolean);
}
