// Maktabning xavfsiz boshqaruv ko'rinishi va o'zgarmas ID qoidalari.
import { fail } from './http.mjs';
import { string } from './validate.mjs';
export function schoolView(row) {
  return {
    id: row.id,
    public_school_id: row.public_school_id || null,
    name: row.name,
    region: row.region || '',
    status: row.status || 'active',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt || row.createdAt,
    subscription: row.subscription || null,
    subscriptionActive: subscriptionActive(row),
    adminLogin: row.adminLogin || null,
  };
}
export function requireImmutableSchoolId(d) {
  for (const field of ['id', 'schoolId', 'school_id', 'publicSchoolId', 'public_school_id'])
    if (d[field] !== undefined) fail("Maktab IDsi o'zgartirilmaydi.", 400);
}
export const schoolName = (value) => string(value, 'Maktab nomi', 160);
export const schoolRegion = (value) => string(value ?? '', 'Hudud', 120, false);
export function subscriptionActive(row, now = Date.now()) {
  return row.subscription?.status === 'active' && Date.parse(row.subscription.endsAt) > now;
}
