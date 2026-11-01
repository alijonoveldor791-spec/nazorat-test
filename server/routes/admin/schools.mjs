// Bosh admin API: maktab, obuna va bir maktabga bitta admin tayinlash.
import { adminRoute } from '../../lib/route.mjs';
import {
  listSchools,
  findSchool,
  saveSchool,
  setSchoolStatus,
  subscription,
} from '../../services/school-service.mjs';
import { schoolStatistics } from '../../services/school-stats-service.mjs';
import { createSchoolAdmin } from '../../services/account-service.mjs';
import { migrateSchoolIds } from '../../services/school-id-migration-service.mjs';
import { fail } from '../../lib/http.mjs';
export const routes = [
  adminRoute('POST', '/super-admin/schools/migrate-public-ids', async ({ auth, body }) => {
    const options = await body();
    if (options.apply !== undefined && typeof options.apply !== 'boolean') fail("apply boolean bo'lsin.");
    if (options.apply && process.env.NETLIFY_DEV !== 'true')
      fail('Migratsiyani yozish faqat lokal Netlify Dev uchun ochiq.', 403);
    return migrateSchoolIds(auth, options);
  }),
  adminRoute('GET', '/super-admin/statistics', ({ auth }) => schoolStatistics(auth)),
  adminRoute('GET', '/super-admin/schools', ({ auth, url }) =>
    listSchools(auth, url.searchParams.get('q') || '')
  ),
  adminRoute('GET', '/super-admin/schools/:id', ({ auth, params }) => findSchool(auth, params.id)),
  adminRoute('PUT', '/super-admin/schools/:id/status', async ({ auth, params, body }) =>
    setSchoolStatus(auth, params.id, await body())
  ),
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
