// Sinflar CRUD uchun HTTP adapterlar.
import { adminRoute } from '../../lib/route.mjs';
import { saveClass, deleteClass } from '../../services/class-service.mjs';
import { adminClasses } from '../../services/student-access-service.mjs';
export const routes = [
  adminRoute('GET', '/admin/classes', () => adminClasses()),
  adminRoute('POST', '/admin/classes', async ({ body }) => saveClass(await body()), 201),
  adminRoute('PUT', '/admin/classes/:id', async ({ params, body }) => saveClass(await body(), params.id)),
  adminRoute('DELETE', '/admin/classes/:id', ({ params }) => deleteClass(params.id)),
];
