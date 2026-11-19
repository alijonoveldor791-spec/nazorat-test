// Netlify Blobs yozuvlarini faqat o'qib, metadata bilan lokal disk nusxasiga ko'chiradi.
import { createHash } from 'node:crypto';
import { getStore, listStores } from '@netlify/blobs';
import { openLocalBlobStore } from './local-blob-store.mjs';

const hash = (data) => createHash('sha256').update(Buffer.from(data)).digest('hex');

export async function copyNetlifySnapshot({ siteId, token, directory, onStore = () => {} }) {
  const local = await openLocalBlobStore(directory);
  const manifest = { siteId, startedAt: new Date().toISOString(), stores: [] };
  try {
    for await (const page of listStores({ siteID: siteId, token, paginate: true })) {
      for (const name of page.stores) {
        const source = getStore({ name, siteID: siteId, token, consistency: 'strong' });
        const target = local.getStore({ name, consistency: 'strong' });
        const store = { name, blobs: [] };
        for await (const { blobs } of source.list({ paginate: true })) {
          for (let index = 0; index < blobs.length; index += 4) {
            const copied = await Promise.all(
              blobs.slice(index, index + 4).map(async ({ key }) => {
                const row = await source.getWithMetadata(key, { type: 'arrayBuffer' });
                if (!row) throw new Error("Nusxalash vaqtida manba yozuvi yo'qoldi; qayta urinib ko'ring.");
                await target.set(key, row.data, { metadata: row.metadata });
                const saved = await target.get(key, { type: 'arrayBuffer' });
                const digest = hash(row.data);
                if (!saved || digest !== hash(saved)) throw new Error("Lokal nusxa tekshiruvi o'tmadi.");
                return { key, etag: row.etag, bytes: row.data.byteLength, sha256: digest };
              })
            );
            store.blobs.push(...copied);
          }
        }
        manifest.stores.push(store);
        onStore({ name, count: store.blobs.length });
      }
    }
    manifest.finishedAt = new Date().toISOString();
    return manifest;
  } finally {
    await local.close();
  }
}
