// Netlify Blobs API bilan mos lokal disk omborini alohida token orqali ochadi.
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import { getStore } from '@netlify/blobs';
import { BlobsServer } from '@netlify/blobs/server';

export async function openLocalBlobStore(directory) {
  const token = randomBytes(32).toString('hex');
  const server = new BlobsServer({ directory: resolve(directory), token, logger: () => {} });
  const { address } = await server.start();
  return {
    getStore(options) {
      return getStore({
        ...(typeof options === 'string' ? { name: options } : options),
        apiURL: address,
        edgeURL: undefined,
        uncachedEdgeURL: undefined,
        siteID: 'local-snapshot',
        token,
      });
    },
    close: () => server.stop(),
  };
}
