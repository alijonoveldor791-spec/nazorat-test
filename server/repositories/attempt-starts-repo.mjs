// Texnik qatnashuv guruhida start rezervi va limit hisobini bitta CAS yozuvda saqlaydi.
import * as blobs from './blob-store.mjs';
export const find = (key) => blobs.get('attempt-starts', key);
export async function initialize(key, row) {
  await blobs.create('attempt-starts', key, row);
  return find(key);
}
export const update = (key, change) => blobs.update('attempt-starts', key, change);
export const clear = () => blobs.clearStore('attempt-starts');
