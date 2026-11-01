// Mavjud maktablarga qisqa IDlarni rejalashtiradi va faqat aniq chaqiruvda yozadi.
import * as schools from '../repositories/schools-repo.mjs';
import * as ids from '../repositories/public-school-ids-repo.mjs';
import { reservePublicSchoolIds } from '../lib/public-school-id.mjs';
import { requireRole } from '../lib/access-context.mjs';
import { fail } from '../lib/http.mjs';
export async function migrateSchoolIds(auth, { apply = false } = {}) {
  requireRole(auth, ['super_admin']);
  const rows = (await schools.list()).sort(
    (a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')) || a.id.localeCompare(b.id)
  );
  const preview = reservePublicSchoolIds(
    await ids.findRegistry(),
    rows,
    rows.map((row) => row.id)
  );
  const registry = apply
    ? await ids.reserve(
        rows,
        rows.map((row) => row.id)
      )
    : preview;
  const changes = rows
    .filter((row) => !row.public_school_id)
    .map((row) => ({
      id: row.id,
      public_school_id: registry.bySchool[row.id],
    }));
  if (apply)
    for (const change of changes) {
      await schools.update(change.id, (row) => {
        if (!row) fail('Migratsiya vaqtida maktab topilmadi.', 409);
        if (row.public_school_id && row.public_school_id !== change.public_school_id)
          fail('Migratsiyada maktab IDsi ziddiyati.', 409);
        return { ...row, public_school_id: change.public_school_id };
      });
    }
  return { applied: apply, total: rows.length, changes };
}
