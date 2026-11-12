// Natijalar va qayta topshirish ruxsatining HTTP adapterlari.
import { exportResultWord } from '../../services/result-word-service.mjs';
import { adminRoute } from '../../lib/route.mjs';
import { pagedResults, resultOverview } from '../../services/result-query-service.mjs';
import {
  listResults,
  recentResults,
  findResult,
  deleteResult,
  allowRetake,
} from '../../services/result-service.mjs';
export const routes = [
  adminRoute('GET', '/admin/results/:id/word', async ({ params }) => {
    const file = await exportResultWord(params.id);
    const encoded = encodeURIComponent(file.filename).replace(
      /['()*]/g,
      (c) => '%' + c.charCodeAt(0).toString(16)
    );
    return new Response(file.bytes, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': "attachment; filename=test-varaqasi.docx; filename*=UTF-8''" + encoded,
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  }),
  adminRoute('GET', '/admin/results', ({ url }) =>
    url.searchParams.has('page')
      ? pagedResults(url.searchParams)
      : listResults({
          testId: url.searchParams.get('testId') || '',
          classId: url.searchParams.get('classId') || '',
        })
  ),
  adminRoute('GET', '/admin/results/overview', () => resultOverview()),
  adminRoute('GET', '/admin/results/recent', () => recentResults()),
  adminRoute('GET', '/admin/results/:id', ({ params }) => findResult(params.id)),
  adminRoute('DELETE', '/admin/results/:id', ({ params }) => deleteResult(params.id)),
  adminRoute('POST', '/admin/results/:id/retake', ({ params }) => allowRetake(params.id)),
];
