// Ochiq test savollari va urinish boshlash HTTP yo’llari.
import { route } from '../../lib/route.mjs';
import { json } from '../../lib/http.mjs';
import { publicTests, publicTest } from '../../services/test-service.mjs';
import { startAttempt } from '../../services/attempt-service.mjs';

export const routes = [
  route('GET', '/tests', ({ url }) =>
    publicTests(url.searchParams.get('classId'), url.searchParams.get('grade'))
  ),
  route('GET', '/tests/:id', ({ params }) => publicTest(params.id)),
  route('GET', '/test/:id', ({ params }) => publicTest(params.id)),
  route('POST', '/tests/:id/start', async ({ params, body, ip }) => {
    const result = await startAttempt(params.id, await body(), ip);
    return json(result.value, result.status);
  }),
];
