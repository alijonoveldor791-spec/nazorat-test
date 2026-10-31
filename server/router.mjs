// HTTP yo’lini tanlaydi, autentifikatsiya va xatolarni bitta joyda boshqaradi.
import { routes } from './routes/index.mjs';
import { HttpError, fail, json, readJson } from './lib/http.mjs';
import { authorize } from './services/auth-service.mjs';
import { ipAddress } from './lib/rate-limit.mjs';

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
  try {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/(?:api|\.netlify\/functions\/api)\/?/, '');
    let parts;
    try {
      parts = path.split('/').filter(Boolean).map(decodeURIComponent);
    } catch {
      fail('Yo’l noto’g’ri.', 404);
    }
    if (parts.length > 4 || parts.some((p) => p.length > 160 || !/^[\w-]+$/.test(p)))
      fail('Yo’l noto’g’ri.', 404);
    for (const route of routes) {
      if (route.method !== request.method) continue;
      const params = matchPath(route.path, parts);
      if (!params) continue;
      const auth = route.admin ? await authorize(request) : null;
      let parsed;
      const body = async () => (parsed ??= await readJson(request));
      const value = await route.handle({ request, url, params, body, auth, ip: ipAddress(request, context) });
      return value instanceof Response ? value : json(value, route.status);
    }
    fail('Topilmadi.', 404);
  } catch (error) {
    if (!(error instanceof HttpError)) console.error('API xatosi:', error);
    return json(
      {
        error:
          error instanceof HttpError ? error.message : 'Server xatosi. Birozdan keyin qayta urinib ko’ring.',
      },
      error.status || 500
    );
  }
}
