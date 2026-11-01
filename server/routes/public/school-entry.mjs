// Kodlar faqat POST body orqali o'tadigan o'quvchi kirish yo'llari.
import { route } from '../../lib/route.mjs';
import { json } from '../../lib/http.mjs';
import { resolveSchoolEntry, startSchoolEntry } from '../../services/school-entry-service.mjs';
export const routes = [
  route('POST', '/school-entry/resolve', async ({ body, ip }) => resolveSchoolEntry(await body(), ip)),
  route('POST', '/school-entry/start', async ({ body, ip }) => {
    const result = await startSchoolEntry(await body(), ip);
    return json(result.value, result.status);
  }),
];
