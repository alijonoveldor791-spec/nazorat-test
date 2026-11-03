// repositories/retakes-repo.mjs: serverdagi shu qatlam vazifasi.
import * as blobs from './blob-store.mjs';
export const find = (key) => blobs.get('retakes', key);
export const grant = (key, requestId) =>
  blobs.update('retakes', key, (row) => {
    if (requestId && row?.requests?.[requestId]) return row;
    return {
      ...row,
      extra: (row?.extra || 0) + 1,
      ...(requestId ? { requests: { ...row?.requests, [requestId]: true } } : {}),
    };
  });
export const clear = () => blobs.clearStore('retakes');
