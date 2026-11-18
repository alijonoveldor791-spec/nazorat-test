// Sahifaning holati va ko'rinish qismlarini birlashtiradi.
import { part0 } from './super-admin-dashboard-page/part-0.js';
import { part1 } from './super-admin-dashboard-page/part-1.js';
export function SuperAdminDashboardPage() {
  const scope = {};
  let result;
  result = part0(scope);
  if (result?.done) return result.value;
  result = part1(scope);
  if (result?.done) return result.value;
}
