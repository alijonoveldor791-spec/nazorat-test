// Testlar CRUD, preview va eksport uchun HTTP adapterlar.
import { adminRoute } from '../../lib/route.mjs';
import {
  listTests,
  saveTest,
  findAdminTest,
  deleteTest,
  toggleTest,
  duplicateTest,
  previewTest,
  exportTest,
} from '../../services/test-service.mjs';
import { assignTest } from '../../services/test-assignment-service.mjs';
import { changeTestCode } from '../../services/test-code-service.mjs';
import { previewWordFile } from '../../services/docx-import-service.mjs';
export const routes = [
  adminRoute('GET', '/admin/tests', () => listTests()),
  adminRoute('POST', '/admin/tests', async ({ body }) => saveTest(await body()), 201),
  adminRoute('POST', '/admin/tests/preview', async ({ body }) => {
    const input = await body();
    return input.file ? previewWordFile(input.file, input.name) : previewTest(input.text);
  }),
  adminRoute('POST', '/admin/tests/preview-document', async ({ body }) => {
    const upload = await body();
    return previewWordFile(upload.file, upload.name);
  }),
  adminRoute('POST', '/admin/preview', async ({ body }) => previewTest((await body()).text)),
  adminRoute('POST', '/admin/tests/:id/assign', async ({ params, body }) =>
    assignTest(params.id, await body())
  ),
  adminRoute('GET', '/admin/tests/:id', ({ params }) => findAdminTest(params.id)),
  adminRoute('POST', '/admin/tests/:id/code', async ({ params, body, ip }) =>
    changeTestCode(params.id, await body(), ip)
  ),
  adminRoute('PUT', '/admin/tests/:id', async ({ params, body }) => saveTest(await body(), params.id)),
  adminRoute('DELETE', '/admin/tests/:id', ({ params }) => deleteTest(params.id)),
  adminRoute('POST', '/admin/tests/:id/toggle', ({ params }) => toggleTest(params.id)),
  adminRoute('POST', '/admin/tests/:id/duplicate', ({ params }) => duplicateTest(params.id), 201),
  adminRoute(
    'GET',
    '/admin/tests/:id/export',
    async ({ params }) =>
      new Response(await exportTest(params.id), {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Content-Disposition': 'attachment; filename="test.txt"',
          'Cache-Control': 'no-store',
        },
      })
  ),
];
