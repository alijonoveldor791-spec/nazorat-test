// Sintetik maktab sessiyasi bilan haqiqiy routerga lokal Request yuboradi.
import { randomUUID } from 'node:crypto';
import { sign } from '../../server/lib/auth-token.mjs';
import { adminSessionSecret } from '../../server/lib/env.mjs';
import { router } from '../../server/router.mjs';

export async function adminClient(blobs, schoolId = 'school-a') {
  const login = 'synthetic-' + randomUUID(),
    version = randomUUID(),
    jti = randomUUID();
  await blobs
    .store('schools')
    .setJSON(schoolId, { id: schoolId, name: 'Synthetic', adminLogin: login, status: 'active' });
  await blobs
    .store('admin-accounts')
    .setJSON(login, { id: login, login, role: 'school_admin', schoolId, version, active: true });
  const expires = Date.now() + 3600000;
  await blobs.store('sessions').setJSON(jti, { id: jti, accountLogin: login, version, expires });
  const token = sign(
    { role: 'admin', accountLogin: login, version, jti, exp: expires },
    adminSessionSecret()
  );
  return async (path, method = 'GET', body) => {
    const response = await router(
      new Request('http://localhost/api/' + path, {
        method,
        headers: {
          Authorization: 'Bearer ' + token,
          ...(body ? { 'Content-Type': 'application/json' } : {}),
        },
        ...(body ? { body: JSON.stringify(body) } : {}),
      }),
      { ip: '127.0.0.1' }
    );
    return { status: response.status, data: await response.json() };
  };
}
