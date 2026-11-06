// SDKning lokal Blobs serverini faqat yangi sintetik temp katalogida ishga tushiradi.
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, dirname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { BlobsServer } from '@netlify/blobs/server';
import { getStore } from '@netlify/blobs';

export async function localBlobs(t) {
  const base = resolve(tmpdir());
  const directory = await mkdtemp(join(base, 'nazorat-synthetic-'));
  const names = [
    'TOKEN_SECRET',
    'ADMIN_SESSION_SECRET',
    'TEST_CODE_ENCRYPTION_KEY',
    'TEST_CODE_LOOKUP_KEY',
    'ADMIN_SESSION_PREVIOUS_SECRET',
    'TEST_CODE_ENCRYPTION_KEY_PREVIOUS',
    'NETLIFY_DEV',
    'ALLOW_LEGACY_SECRET_FALLBACK',
    'ALLOW_LEGACY_LOOKUP_KEY',
  ];
  const previous = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  const previousContext = globalThis.netlifyBlobsContext;
  const operations = {};
  const token = randomUUID();
  const server = new BlobsServer({
    directory,
    token,
    logger: () => {},
    onRequest: ({ type }) => {
      operations[type] = (operations[type] || 0) + 1;
    },
  });
  t.after(async () => {
    await server.stop();
    for (const name of names)
      if (previous[name] === undefined) delete process.env[name];
      else process.env[name] = previous[name];
    if (previousContext === undefined) delete globalThis.netlifyBlobsContext;
    else globalThis.netlifyBlobsContext = previousContext;
    // Faqat helper yaratgan aniq temp katalogini o'chirish mumkin.
    if (dirname(resolve(directory)) !== base || !directory.startsWith(join(base, 'nazorat-synthetic-')))
      throw new Error('Sintetik temp katalogi chegaradan tashqarida.');
    await rm(directory, { recursive: true, force: true });
  });
  for (const name of names) delete process.env[name];
  for (const name of names.slice(0, 4)) process.env[name] = randomUUID() + randomUUID();
  process.env.NETLIFY_DEV = 'true';
  const { port } = await server.start();
  const address = `http://localhost:${port}`;
  // Client config test processida; hech qachon .env yoki mavjud site config o'qilmaydi.
  globalThis.netlifyBlobsContext = Buffer.from(
    JSON.stringify({
      siteID: 'synthetic-' + randomUUID(),
      token,
      edgeURL: address,
      uncachedEdgeURL: address,
    })
  ).toString('base64');
  const store = (name) => getStore({ name, consistency: 'strong' });
  return { store, writes: () => (operations.set || 0) + (operations.delete || 0) };
}
