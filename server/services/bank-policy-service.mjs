// Tarif va maktab istisnolarini har bir umumiy bank amalida serverda tekshiradi.
import * as repo from '../repositories/library-repo.mjs';
import * as schools from '../repositories/schools-repo.mjs';
import { currentAccess, requireRole } from '../lib/access-context.mjs';
import { subscriptionActive } from '../lib/school.mjs';
import { string } from '../lib/validate.mjs';
import { fail } from '../lib/http.mjs';
export const BANK_ACTIONS = ['view', 'take', 'docx', 'pdf', 'key', 'rerunExpired'];
export async function bankAccess(schoolId = currentAccess()?.schoolId) {
  const school = await schools.find(schoolId);
  if (!school) fail('Maktab topilmadi.', 404);
  const assigned = await repo.policy('school-' + schoolId);
  const tariffId = assigned?.tariffId || '';
  const tariff = tariffId ? await repo.policy('tariff-' + tariffId) : null;
  const rules = { ...tariff?.rules, ...assigned?.rules };
  const active = subscriptionActive(school);
  const permissions = Object.fromEntries(
    BANK_ACTIONS.map((key) => [
      key,
      rules.view === true && rules[key] === true && (active || key === 'rerunExpired'),
    ])
  );
  return { schoolId, tariffId, active, permissions };
}
export async function requireBank(action, entry) {
  const access = await bankAccess();
  if (!access.permissions[action]) fail('Tarif bu amalga ruxsat bermaydi.', 403);
  if (entry && !entry.schoolIds.includes(access.schoolId) && !entry.tariffIds.includes(access.tariffId))
    fail('Bu test maktabingiz uchun ochilmagan.', 403);
  return access;
}
export async function requireOrigin(test, action) {
  if (test.origin?.type !== 'shared') return;
  const access = await bankAccess(test.schoolId);
  const key = action === 'online' ? (access.active ? 'take' : 'rerunExpired') : action;
  if (!access.permissions[key]) fail("Umumiy bank nusxasi uchun tarif ruxsati yo'q.", 403);
}
export async function listPolicies() {
  requireRole(currentAccess(), ['super_admin']);
  return repo.policies();
}
export async function saveBankPolicy(input) {
  requireRole(currentAccess(), ['super_admin']);
  if (!['school', 'tariff'].includes(input.type)) fail('Tarif yoki maktab tanlang.');
  const target = string(input.target, 'ID', 100);
  if (!/^[\w-]+$/.test(target)) fail("ID faqat harf, raqam va defisdan iborat bo'lsin.");
  if (input.type === 'school' && !(await schools.find(target))) fail('Maktab topilmadi.', 404);
  const rules = {};
  for (const key of BANK_ACTIONS) {
    if (input.rules?.[key] !== undefined && typeof input.rules[key] !== 'boolean')
      fail("Ruxsat mantiqiy bo'lsin.");
    if (input.rules?.[key] !== undefined) rules[key] = input.rules[key];
  }
  const row = {
    id: input.type + '-' + target,
    type: input.type,
    target,
    rules,
    tariffId: string(input.tariffId || '', 'Tarif ID', 100, false),
  };
  await repo.savePolicy(row.id, row);
  return row;
}
