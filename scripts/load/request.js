// k6 so'rovlarini endpoint, status, retry va yakuniy kechikish bo'yicha o'lchaydi.
import http from 'k6/http';
import { sleep } from 'k6';
import { Counter, Rate, Trend } from 'k6/metrics';
export const serverErrors = new Rate('valid_server_errors');
export const rejected = new Rate('valid_rejections');
export const throttled = new Counter('responses_429');
export const requests = new Counter('application_requests');
export const elapsed = new Trend('operation_ms', true);
const blobReads = new Trend('blob_reads');
const blobWrites = new Trend('blob_writes');
export const responseBytes = new Trend('response_bytes');
export function request(fixture, endpoint, body, token, expected = [200, 201], valid = true) {
  const start = Date.now();
  let response;
  const op = endpoint.split('/').at(-1);
  for (let retry = 0; retry <= Number(__ENV.RETRIES || 2); retry++) {
    response = http.request(
      body ? 'POST' : 'GET',
      fixture.baseUrl + '/api/' + endpoint,
      body ? JSON.stringify(body) : null,
      {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: 'Bearer ' + token } : {}),
        },
        tags: { op, name: endpoint.startsWith('admin/results/') ? 'admin/results/detail' : endpoint },
        timeout: '30s',
        redirects: 0,
      }
    );
    requests.add(1, { op, status: String(response.status) });
    const timing = response.headers['Server-Timing'] || '';
    const reads = /blob_read;desc="([\d.]+)"/.exec(timing),
      writes = /blob_write;desc="([\d.]+)"/.exec(timing);
    if (reads) blobReads.add(Number(reads[1]), { op });
    if (writes) blobWrites.add(Number(writes[1]), { op });
    responseBytes.add(response.body ? response.body.length : 0, { op });
    if (valid) {
      serverErrors.add(response.status === 0 || response.status >= 500, { op });
      rejected.add(response.status >= 400 && response.status < 500, { op });
    }
    if (response.status === 429) throttled.add(1, { op });
    if (expected.includes(response.status) || ![0, 429, 500, 502, 503, 504].includes(response.status)) break;
    if (retry < Number(__ENV.RETRIES || 2))
      sleep(Math.min(60, Number(response.headers['Retry-After']) || (retry + 1) * 0.5));
  }
  elapsed.add(Date.now() - start, { op });
  let value;
  try {
    value = response.json();
  } catch {
    value = {};
  }
  return { ok: expected.includes(response.status), status: response.status, value };
}
