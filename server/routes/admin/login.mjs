// Login yo'li boshqa admin yo'llaridan oldin ochiq bo'lishi kerak.
import { route } from '../../lib/route.mjs';
import { accountLogin } from '../../services/account-service.mjs';
import { auditEvent } from '../../services/audit-service.mjs';
const loginActor = (value) => (typeof value === 'string' ? value.slice(0, 60).toLowerCase() : null);
export const routes = [
  route('POST', '/admin/login', async ({ body, ip }) => {
    const d = await body();
    try {
      const result = await accountLogin(d, ip);
      await auditEvent({ action: 'admin.login', actorId: loginActor(d.login), outcome: 'success' });
      return result;
    } catch (error) {
      await auditEvent({
        action: 'admin.login',
        actorId: loginActor(d.login),
        outcome: 'failure',
        statusCode: error.status || 500,
      });
      throw error;
    }
  }),
];
