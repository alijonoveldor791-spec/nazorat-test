// Login yo’li boshqa admin yo’llaridan oldin ochiq bo’lishi kerak.
import { route } from '../../lib/route.mjs';
import { login } from '../../services/auth-service.mjs';
export const routes = [
  route('POST', '/admin/login', async ({ body, ip }) => login((await body()).password, ip)),
];
