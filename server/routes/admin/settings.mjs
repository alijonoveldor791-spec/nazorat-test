// Admin sozlamalaridagi parol almashtirish HTTP yo'li.
import { adminRoute } from '../../lib/route.mjs';
import { changePassword, logout } from '../../services/auth-service.mjs';
import { passwordMinimum, passwordMaximum } from '../../lib/password-policy.mjs';
export const routes = [
  adminRoute('GET', '/admin/session', ({ auth }) => ({
    authenticated: true,
    role: auth.role,
    schoolId: auth.schoolId || null,
    public_school_id: auth.public_school_id || null,
    schoolName: auth.schoolName || null,
    login: auth.login || null,
    passwordMinLength: passwordMinimum(),
    passwordMaxLength: passwordMaximum(),
  })),
  adminRoute('POST', '/admin/password', async ({ body, auth, ip }) => changePassword(await body(), auth, ip)),
  adminRoute('POST', '/admin/logout', ({ auth }) => logout(auth)),
];
