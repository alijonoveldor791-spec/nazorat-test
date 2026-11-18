// Node.js HTTP server running on port 3000 (0.0.0.0) with API router + Vite React SPA.
import { createServer } from 'node:http';
import { randomBytes } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { Readable } from 'node:stream';
import { router } from './server/router.mjs';

try {
  process.loadEnvFile?.('.env');
} catch {
  /* .env is optional */
}

if (!process.env.TOKEN_SECRET || process.env.TOKEN_SECRET.length < 32) {
  process.env.TOKEN_SECRET = randomBytes(32).toString('hex');
}

const PORT = 3000;
const HOST = '0.0.0.0';
const DIST_DIR = resolve(process.cwd(), 'dist');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
};

function toWebRequest(req) {
  const host = req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.url || '/', `http://${host}`);
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) value.forEach((v) => headers.append(key, v));
    else if (value !== undefined) headers.set(key, value);
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  return new Request(url, {
    method: req.method,
    headers,
    ...(hasBody ? { body: Readable.toWeb(req), duplex: 'half' } : {}),
  });
}

async function sendWebResponse(res, response) {
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  res.writeHead(response.status, headers);
  if (!response.body) {
    res.end();
    return;
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  res.end(buffer);
}

async function serveDist(pathname, res) {
  let cleanPath;
  try {
    cleanPath = decodeURIComponent(pathname.split('?')[0]);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }
  const relativePath = cleanPath.replace(/^\/+/, '');
  let target = resolve(DIST_DIR, relativePath || 'index.html');
  if (target !== DIST_DIR && !target.startsWith(DIST_DIR + sep)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }
  try {
    const info = await stat(target);
    if (info.isDirectory()) target = resolve(DIST_DIR, 'index.html');
    const data = await readFile(target);
    const contentType = MIME_TYPES[extname(target).toLowerCase()] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  } catch {
    try {
      const indexHtml = await readFile(resolve(DIST_DIR, 'index.html'));
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(indexHtml);
    } catch {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
    }
  }
}

const isProd = process.env.NODE_ENV === 'production';
let vite = null;
if (!isProd) {
  const { createServer: createViteServer } = await import('vite');
  vite = await createViteServer({
    server: { middlewareMode: true, hmr: false },
    appType: 'spa',
  });
}

const server = createServer(async (req, res) => {
  try {
    const pathname = (req.url || '/').split('?')[0];
    if (pathname.startsWith('/api/') || pathname.startsWith('/.netlify/functions/api')) {
      const ip = req.socket?.remoteAddress || '127.0.0.1';
      const response = await router(toWebRequest(req), { ip });
      await sendWebResponse(res, response);
      return;
    }
    if (vite) {
      vite.middlewares(req, res, () => {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('Not Found');
      });
      return;
    }
    await serveDist(pathname, res);
  } catch (error) {
    console.error('Server error:', error);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Internal Server Error');
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Nazorat React server listening on http://${HOST}:${PORT}`);
});
