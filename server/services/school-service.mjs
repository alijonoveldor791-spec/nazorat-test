// Bosh adminning minimal maktab metama’lumoti va obuna boshqaruvi.
import { randomUUID } from 'node:crypto';
import * as schools from '../repositories/schools-repo.mjs';
import { requireRole } from '../lib/access-context.mjs';
import { string } from '../lib/validate.mjs';
import { fail } from '../lib/http.mjs';
const view = ({ id, name, createdAt, subscription, adminLogin }) => ({
  id,
  name,
  createdAt,
  subscription,
  adminLogin,
});
export async function listSchools(auth) {
  requireRole(auth, ['super_admin']);
  return (await schools.list()).map(view);
}
export async function saveSchool(auth, d, id) {
  requireRole(auth, ['super_admin']);
  if (d.id !== undefined || d.schoolId !== undefined) fail('Maktab IDsi o‘zgartirilmaydi.', 400);
  const name = string(d.name, 'Maktab nomi', 160);
  if (id)
    return view(
      await schools.update(id, (row) => {
        if (!row) fail('Maktab topilmadi.', 404);
        return { ...row, name };
      })
    );
  const row = { id: randomUUID(), name, createdAt: new Date().toISOString(), subscription: null };
  if (!(await schools.create(row))) fail('Maktab yaratilmadi. Qayta urinib ko‘ring.', 409);
  return view(row);
}
export async function subscription(auth, id, d) {
  requireRole(auth, ['super_admin']);
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
