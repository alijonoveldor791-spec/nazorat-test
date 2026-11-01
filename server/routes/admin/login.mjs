// Login yo'li boshqa admin yo'llaridan oldin ochiq bo'lishi kerak.
import { route } from '../../lib/route.mjs';
import { login } from '../../services/auth-service.mjs';
import { accountLogin } from '../../services/account-service.mjs';
export const routes = [
  route('POST', '/admin/login', async ({ body, ip }) => {
    const d = await body();
    return d.login ? accountLogin(d, ip) : login(d.password, ip);
  }),
];
