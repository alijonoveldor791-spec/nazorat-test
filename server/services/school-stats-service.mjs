// Maktablar monitoringi uchun haqiqiy, faqat agregat statistikani quradi.
import * as schools from '../repositories/schools-repo.mjs';
import { countsBySchool } from '../repositories/school-stats-repo.mjs';
import { requireRole } from '../lib/access-context.mjs';
import { subscriptionActive } from '../lib/school.mjs';
export async function schoolStatistics(auth) {
  requireRole(auth, ['super_admin']);
  const [rows, classes, tests, attempts, results] = await Promise.all([
    schools.list(),
    countsBySchool('classes'),
    countsBySchool('tests'),
    countsBySchool('attempts'),
    countsBySchool('results'),
  ]);
  const sum = (map) => [...map.values()].reduce((total, n) => total + n, 0);
  const known = new Set(rows.map((row) => row.id));
  const unassigned = (map) => [...map].reduce((total, [id, n]) => total + (known.has(id) ? 0 : n), 0);
  return {
    updatedAt: new Date().toISOString(),
    totalSchools: rows.length,
    activeSchools: rows.filter((row) => (row.status || 'active') === 'active').length,
    activeSubscriptions: rows.filter((row) => subscriptionActive(row)).length,
    totalTests: sum(tests),
    totalAttempts: sum(attempts),
    unassigned: { tests: unassigned(tests), attempts: unassigned(attempts) },
    bySchool: rows.map((row) => ({
      schoolId: row.id,
      classes: classes.get(row.id) || 0,
      tests: tests.get(row.id) || 0,
      attempts: attempts.get(row.id) || 0,
      results: results.get(row.id) || 0,
    })),
  };
}
