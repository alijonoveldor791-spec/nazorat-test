// Bosh admin API: maktab, obuna va bir maktabga bitta admin tayinlash.
import { adminRoute } from '../../lib/route.mjs';
import { listSchools, saveSchool, subscription } from '../../services/school-service.mjs';
import { createSchoolAdmin } from '../../services/account-service.mjs';
export const routes = [
  adminRoute('GET', '/super-admin/schools', ({ auth }) => listSchools(auth)),
  adminRoute('POST', '/super-admin/schools', async ({ auth, body }) => saveSchool(auth, await body()), 201),
  adminRoute('PUT', '/super-admin/schools/:id', async ({ auth, params, body }) =>
    saveSchool(auth, await body(), params.id)
  ),
  adminRoute(
    'POST',
    '/super-admin/schools/:id/admin',
    async ({ auth, params, body }) => createSchoolAdmin(auth, params.id, await body()),
    201
  ),
  adminRoute('PUT', '/super-admin/schools/:id/subscription', async ({ auth, params, body }) =>
    subscription(auth, params.id, await body())
  ),
];
