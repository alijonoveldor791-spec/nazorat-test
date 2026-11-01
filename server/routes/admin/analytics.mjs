// Savollar tahlili so'rovini statistik xizmatga uzatadi.
import { adminRoute } from '../../lib/route.mjs';
import { testAnalysis } from '../../services/analytics-service.mjs';
export const routes = [
  adminRoute('GET', '/admin/analysis', ({ url }) => testAnalysis(url.searchParams.get('testId') || '')),
];
