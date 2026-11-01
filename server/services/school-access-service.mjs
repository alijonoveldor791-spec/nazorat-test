// Maktab bloklanishini va maktab sessiya versiyasini har so'rovda tekshiradi.
import * as schools from '../repositories/schools-repo.mjs';
import { fail } from '../lib/http.mjs';
export async function accountSchool(account, session) {
  if (account.role !== 'school_admin') return null;
  const school = account.schoolId ? await schools.find(account.schoolId) : null;
  if (!school || school.adminLogin !== account.login) fail('Maktabga kirish mumkin emas.', 403);
  if (school.status && school.status !== 'active')
    fail('Maktabga kirish bloklangan. Bosh adminga murojaat qiling.', 403);
  if (session && session.schoolVersion !== school.sessionVersion)
    fail('Maktab sessiyasi bekor qilingan. Qayta kiring.', 401);
  return school;
}
