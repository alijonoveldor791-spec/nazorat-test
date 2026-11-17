// Fayl va chop nusxasi oldidan test kelib chiqishi va alohida eksport ruxsatini tekshiradi.
import { findTest } from './test-service.mjs';
import { requireOrigin } from './bank-policy-service.mjs';
import { findShared } from './shared-bank-service.mjs';
import { testDocx, testPrint } from '../lib/test-document.mjs';
import { fail } from '../lib/http.mjs';
export async function exportDocument(id, format, shared = false) {
  if (!['docx', 'pdf', 'key'].includes(format)) fail("Eksport turi noto'g'ri.");
  const test = shared ? await findShared(id, format) : await findTest(id);
  if (!shared) await requireOrigin(test, format);
  const print = format === 'pdf';
  return new Response(print ? testPrint(test) : testDocx(test, format === 'key'), {
    headers: {
      'Content-Type': print
        ? 'text/html; charset=utf-8'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `${print ? 'inline' : 'attachment'}; filename="${format === 'key' ? 'javoblar' : 'test'}.${print ? 'html' : 'docx'}"`,
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
