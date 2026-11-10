// Maktab doirasida mavjud biriktirishlarga qo'shimcha auditoriyalarni atomik qo'shadi.
import * as tests from '../repositories/tests-repo.mjs';
import { listClasses } from './class-service.mjs';
import { fail } from '../lib/http.mjs';
import { string } from '../lib/validate.mjs';
export async function assignTest(id, payload) {
  if (!(await tests.find(id))) fail('Test topilmadi.', 404);
  const ids = payload.classIds;
  if (!Array.isArray(ids) || !ids.length || ids.length > 40 || ids.some((id) => typeof id !== 'string'))
    fail('1-40 ta sinf yoki guruh tanlang.');
  const classes = await listClasses(true);
  const rows = ids.map((id) => classes.find((c) => c.id === id));
  if (rows.some((c) => !c)) fail('Sinf yoki guruh topilmadi.', 404);
  const direction = string(payload.direction || '', "Yo'nalish", 100, false);
  if (rows.some((c) => c.kind === 'group' && c.direction !== direction)) fail("Guruh yo'nalishi mos emas.");
  await tests.update(id, (old) => {
    if (!old) fail('Test topilmadi.', 404);
    if (old.direction && direction && old.direction !== direction) fail("Test yo'nalishi mos emas.");
    const classIds = [...new Set([...(old.classIds || []), ...ids])];
    if (classIds.length > 40) fail('40 tadan ortiq auditoriya mumkin emas.');
    return {
      ...old,
      classIds,
      direction: old.direction || direction,
      grades: classIds.map((id) => classes.find((c) => c.id === id)?.name || id),
    };
  });
  return { ok: true };
}
