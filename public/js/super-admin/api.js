// Bosh adminning yopiq API chaqiruvlariga joriy server sessiyasini ulaydi.
import { api } from '../core/api-client.js';
import { getToken } from '../core/auth.js';
export const call = (path, method = 'GET', body) =>
  api('super-admin/' + path, {
    token: getToken(),
    method,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
