// Admin sozlamalaridagi parol almashtirish HTTP yo’li.
import { adminRoute } from '../../lib/route.mjs';
import { changePassword } from '../../services/auth-service.mjs';
export const routes = [
  adminRoute('POST', '/admin/password', async ({ body, auth }) => changePassword(await body(), auth)),
];
