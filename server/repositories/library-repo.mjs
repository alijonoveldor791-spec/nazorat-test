// Maktab mavzularini egalik filtri, umumiy tayyor testlarni alohida omborda saqlaydi.
import * as blobs from './blob-store.mjs';
export {
  list as topics,
  find as topic,
  create as createTopic,
  update as updateTopic,
} from './topics-repo.mjs';
export const shared = () => blobs.all('shared-tests', true);
export const sharedTest = (id) => blobs.get('shared-tests', id);
export const createShared = (row) => blobs.create('shared-tests', row.id, row);
export const updateShared = (id, change) => blobs.update('shared-tests', id, change);
export const policies = () => blobs.all('bank-policies', true);
export const policy = (id) => blobs.get('bank-policies', id);
export const savePolicy = (id, row) => blobs.put('bank-policies', id, row);
