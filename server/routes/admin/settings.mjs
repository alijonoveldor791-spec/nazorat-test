// Admin sozlamalaridagi parol almashtirish HTTP yo’li.
import { adminRoute } from '../../lib/route.mjs';
import { changePassword, logout } from '../../services/auth-service.mjs';
import { passwordMinimum } from '../../lib/password-policy.mjs';
export const routes = [
  adminRoute('GET', '/admin/session', () => ({ authenticated: true, passwordMinLength: passwordMinimum() })),
  adminRoute('POST', '/admin/password', async ({ body, auth, ip }) => changePassword(await body(), auth, ip)),
  adminRoute('POST', '/admin/logout', ({ auth }) => logout(auth)),
];
