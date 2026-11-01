// Global CAS registri: raqam, maktab rezervi va qayta berilmaydigan ID bir yozuvda.
import * as blobs from './blob-store.mjs';
import { reservePublicSchoolIds } from '../lib/public-school-id.mjs';
const STORE = 'public-school-ids';
const KEY = 'registry';
export const findRegistry = () => blobs.get(STORE, KEY);
export const reserve = (existing, targets) =>
  blobs.update(STORE, KEY, (row) => reservePublicSchoolIds(row, existing, targets));
export async function schoolIdFor(code) {
  return (await findRegistry())?.byPublic[code] || null;
}
