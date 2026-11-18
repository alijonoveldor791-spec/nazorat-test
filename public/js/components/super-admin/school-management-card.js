// Sahifaning holati va ko'rinish qismlarini birlashtiradi.
import { part0 } from './school-management-card/part-0.js';
export function SchoolManagementCard({ school, counts, copied, onCopyId, onToggleStatus, onUpdated }) {
  const scope = {};
  let result;
  scope.school = school;
  scope.counts = counts;
  scope.copied = copied;
  scope.onCopyId = onCopyId;
  scope.onToggleStatus = onToggleStatus;
  scope.onUpdated = onUpdated;
  result = part0(scope);
  if (result?.done) return result.value;
}
