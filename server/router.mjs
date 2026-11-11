// HTTP yo\'lini tanlaydi, autentifikatsiya va xatolarni bitta joyda boshqaradi.
import { routes } from './routes/index.mjs';
import { HttpError, fail, json, readJson, readForm } from './lib/http.mjs';
import { authorize } from './services/auth-service.mjs';
import { ipAddress } from './lib/rate-limit.mjs';
import { runWithAccess, requireRole } from './lib/access-context.mjs';
import { auditEvent } from './services/audit-service.mjs';

function matchPath(pattern, parts) {
  const expected = pattern.split('/').filter(Boolean);
  if (parts.length !== expected.length) return null;
  const params = {};
  for (let index = 0; index < parts.length; index++) {
    if (expected[index].startsWith(':')) params[expected[index].slice(1)] = parts[index];
    else if (expected[index] !== parts[index]) return null;
  }
  return params;
}

export async function router(request, context) {
  let auditedRoute = null, auditedAuth = null, auditedParams = {};
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/(?:api|\.netlify\/functions\/api)\/?/, '');
    let parts;
    try {
      parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    } catch {
      fail("Yo'l noto'g'ri.", 404);
    }
    if (parts.length > 4 || parts.some((p) => p.length > 160 || !/^[\w-]+$/.test(p)))
      fail("Yo'l noto'g'ri.", 404);
    for (const route of routes) {
      if (route.method !== request.method) continue;
      const params = matchPath(route.path, parts);
      if (!params) continue;
      auditedRoute = route;
      auditedParams = params;
      const auth = route.admin ? await authorize(request) : null;
      auditedAuth = auth;
      if (route.admin) {
        const common = ['/admin/session', '/admin/password', '/admin/logout'].includes(route.path);
        const superOnly = route.path.startsWith('/super-admin/');
        requireRole(
          auth,
          common ? ['super_admin', 'school_admin'] : superOnly ? ['super_admin'] : ['school_admin']
        );
        if (auth.role !== 'legacy_admin' && route.path === '/admin/clear')
          fail('Tozalash vakolati faqat eski legacy admin uchun.', 403);
      }
      let parsed;
      const body = async () => {
        parsed ??= request.headers.get('content-type')?.toLowerCase().startsWith('multipart/form-data')
          ? await readForm(request)
          : await readJson(request);
        if (
          route.admin &&
          !route.path.startsWith('/super-admin/') &&
          (parsed.schoolId !== undefined || parsed.role !== undefined)
        )
          fail('Rol va maktabni almashtirish mumkin emas.', 403);
        return parsed;
      };
      const value = await runWithAccess(auth, () =>
        route.handle({ request, url, params, body, auth, ip: ipAddress(request, context) })
      );
      if (route.admin && request.method !== 'GET') await auditEvent({
        action: route.path.replace(/:[^/]+/g, 'item'), actorId: auth?.accountLogin || auth?.role,
        schoolId: auth?.schoolId, objectId: params.id, outcome: 'success',
      });
      return value instanceof Response ? value : json(value, route.status);
    }
    fail('Topilmadi.', 404);
  } catch (error) {
    if (auditedRoute?.admin && request.method !== 'GET') {
      try {
        await auditEvent({ action: auditedRoute.path.replace(/:[^/]+/g, 'item'),
          actorId: auditedAuth?.accountLogin || auditedAuth?.role, schoolId: auditedAuth?.schoolId,
          objectId: auditedParams.id, outcome: 'failure', statusCode: error.status || 500 });
      } catch { /* Audit yozuvi so'rov xatosini yashirmaydi. */ }
    }
    if (!(error instanceof HttpError)) console.error('API xatosi:', error);
    return json(
      {
        error:
          error instanceof HttpError ? error.message : "Server xatosi. Birozdan keyin qayta urinib ko'ring.",
      },
      error.status || 500,
      error.status === 429 ? { 'Retry-After': String(error.retryAfter || 60) } : {}
    );
  }
}
