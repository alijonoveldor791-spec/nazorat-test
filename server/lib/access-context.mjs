// So‘rov doirasidagi rol va maktab egaligini asinxron amallar orasida saqlaydi.
import { AsyncLocalStorage } from 'node:async_hooks';
import { fail } from './http.mjs';
const CONTEXT = new AsyncLocalStorage();
export const runWithAccess = (auth, action) => CONTEXT.run(auth || null, action);
export const currentAccess = () => CONTEXT.getStore();
export function ownsRow(row) {
  if (!row) return false;
  const auth = currentAccess();
  if (!auth || auth.role === 'legacy_admin') return !row.schoolId;
  return ['school_admin', 'school_student'].includes(auth.role) && row.schoolId === auth.schoolId;
}
export function ownedRow(row) {
  if (!ownsRow(row)) fail("Ma'lumot topilmadi yoki unga kirish mumkin emas.", 404);
  return row;
}
export function stampRow(row) {
  const auth = currentAccess();
  if (auth?.role === 'super_admin') fail('Bu amalga ruxsat yo‘q.', 403);
  if (row.schoolId && row.schoolId !== auth?.schoolId) fail('Maktabni almashtirish mumkin emas.', 403);
  return auth?.schoolId ? { ...row, schoolId: auth.schoolId } : row;
}
export function requireRole(auth, roles) {
  if (!auth || !roles.includes(auth.role)) fail('Bu amalga ruxsat yo‘q.', 403);
}
