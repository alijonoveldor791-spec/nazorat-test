// Bosh adminning doimiy maktab IDsi, tahrir, holat va obuna boshqaruvi.
import { randomUUID } from 'node:crypto';
import * as schools from '../repositories/schools-repo.mjs';
import { requireRole } from '../lib/access-context.mjs';
import { string } from '../lib/validate.mjs';
import { fail } from '../lib/http.mjs';
import { schoolView as view, requireImmutableSchoolId, schoolName, schoolRegion } from '../lib/school.mjs';
import { createSchool } from './school-create-service.mjs';
export async function listSchools(auth, query = '') {
  requireRole(auth, ['super_admin']);
  const q = string(query, 'Qidiruv', 160, false).toLowerCase();
  return (await schools.list())
    .map(view)
    .filter(
      (row) =>
        !q ||
        row.id.toLowerCase().includes(q) ||
        row.public_school_id?.toLowerCase().includes(q) ||
        row.name.toLowerCase().includes(q)
    );
}
export async function findSchool(auth, id) {
  requireRole(auth, ['super_admin']);
  const row = await schools.find(id);
  if (!row) fail('Maktab topilmadi.', 404);
  return view(row);
}
export async function saveSchool(auth, d, id) {
  requireRole(auth, ['super_admin']);
  requireImmutableSchoolId(d);
  const name = schoolName(d.name);
  if (id)
    return view(
      await schools.update(id, (row) => {
        if (!row) fail('Maktab topilmadi.', 404);
        return {
          ...row,
          name,
          region: d.region === undefined ? row.region || '' : schoolRegion(d.region),
          updatedAt: new Date().toISOString(),
        };
      })
    );
  return view(await createSchool(auth, name, schoolRegion(d.region), d.requestId));
}
export async function setSchoolStatus(auth, id, d) {
  requireRole(auth, ['super_admin']);
  requireImmutableSchoolId(d);
  if (!['active', 'blocked', 'archived'].includes(d.status)) fail("Maktab holati noto'g'ri.");
  return view(
    await schools.update(id, (row) => {
      if (!row) fail('Maktab topilmadi.', 404);
      if ((row.status || 'active') === d.status) return row;
      if (row.status === 'archived') fail("Arxivlangan maktab holati o'zgartirilmaydi.", 409);
      return { ...row, status: d.status, sessionVersion: randomUUID(), updatedAt: new Date().toISOString() };
    })
  );
}
export async function subscription(auth, id, d) {
  requireRole(auth, ['super_admin']);
  requireImmutableSchoolId(d);
  if (!['active', 'expired'].includes(d.status)) fail('Obuna holati noto‘g‘ri.');
  if (typeof d.endsAt !== 'string' || !Number.isFinite(Date.parse(d.endsAt)))
    fail('Obuna muddati noto‘g‘ri.');
  return view(
    await schools.update(id, (row) => {
      if (!row) fail('Maktab topilmadi.', 404);
      return { ...row, subscription: { status: d.status, endsAt: new Date(d.endsAt).toISOString() } };
    })
  );
}
