// k6 voqealaridan haqiqiy faol sessiyalar va 500 kishilik plato vaqtini chiqaradi.
import { createReadStream } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';
import { createInterface } from 'node:readline';
export async function analyze(prefix) {
  const raw = JSON.parse(await readFile(prefix + '.summary.json', 'utf8'));
  const startTimes = [],
    submitTimes = [];
  const blobSamples = {};
  const operationCounts = {},
    statusCounts = {};
  const events = [],
    starts = new Set(),
    finishes = new Set();
  const stream = createInterface({ input: createReadStream(prefix + '.events.json'), crlfDelay: Infinity });
  for await (const line of stream) {
    let row;
    try {
      row = JSON.parse(line);
    } catch {
      continue;
    }
    if (row.type === 'Point' && ['blob_reads', 'blob_writes'].includes(row.metric)) {
      const key = row.data.tags.op + '/' + row.metric;
      (blobSamples[key] ||= []).push(row.data.value);
    }
    if (row.type === 'Point' && row.metric === 'application_requests')
      statusCounts[row.data.tags.status] = (statusCounts[row.data.tags.status] || 0) + row.data.value;
    if (row.type === 'Point' && row.metric === 'operation_ms')
      operationCounts[row.data.tags.op] = (operationCounts[row.data.tags.op] || 0) + 1;
    if (
      row.type !== 'Point' ||
      !['sessions_started', 'sessions_ended', 'sessions_completed'].includes(row.metric)
    )
      continue;
    const id = row.data.tags.session,
      time = Date.parse(row.data.time);
    if (row.metric === 'sessions_started') {
      starts.add(id);
      startTimes.push(time);
      events.push({ time, delta: 1 });
    }
    if (row.metric === 'sessions_ended') events.push({ time, delta: -1 });
    if (row.metric === 'sessions_completed') {
      finishes.add(id);
      submitTimes.push(time);
    }
  }
  events.sort((a, b) => a.time - b.time || b.delta - a.delta);
  let active = 0,
    peak = 0,
    plateau = 0,
    since = null;
  for (const event of events) {
    active += event.delta;
    peak = Math.max(peak, active);
    if (active === raw.count && since === null) since = event.time;
    if (active < raw.count && since !== null) {
      plateau = Math.max(plateau, event.time - since);
      since = null;
    }
  }
  const values = (name) => raw.summary.metrics[name]?.values || {};
  const operations = {};
  for (const op of ['resolve', 'start', 'draft', 'resume', 'submit', 'results'])
    operations[op] = operationCounts[op]
      ? { ...values(`operation_ms{op:${op}}`), samples: operationCounts[op] }
      : null;
  const blobOperations = Object.fromEntries(
    Object.entries(blobSamples).map(([key, values]) => {
      values.sort((a, b) => a - b);
      return [
        key,
        {
          samples: values.length,
          mean: values.reduce((a, b) => a + b, 0) / values.length,
          p95: values[Math.ceil(values.length * 0.95) - 1],
        },
      ];
    })
  );
  const result = {
    blobOperations,
    run: raw.run,
    deadlineMode: raw.deadlineMode === true,
    statusCounts,
    kind: raw.kind,
    environment: raw.environment,
    requestedSessions: raw.count,
    started: starts.size,
    completed: finishes.size,
    peakActive: peak,
    startSpreadSeconds: startTimes.length ? (Math.max(...startTimes) - Math.min(...startTimes)) / 1000 : null,
    submitSpreadSeconds: submitTimes.length
      ? (Math.max(...submitTimes) - Math.min(...submitTimes)) / 1000
      : null,
    fullConcurrencySeconds: plateau / 1000,
    requestCount: values('application_requests').count || 0,
    httpRequests: values('http_reqs').count || 0,
    response429: values('responses_429').count || 0,
    serverErrors: values('valid_server_errors'),
    serverErrorRate: values('valid_server_errors').rate,
    validRejectionRate: values('valid_rejections').rate,
    operations,
    bytesReceived: values('data_received').count,
    checks: values('checks'),
    thresholdsPassed: Object.values(raw.summary.metrics).every((m) =>
      Object.values(m.thresholds || {}).every((t) => t.ok)
    ),
    source: prefix,
  };
  result.plateauTargetMet = result.peakActive === raw.count && result.fullConcurrencySeconds >= raw.hold;
  result.phasePassed = result.thresholdsPassed && result.plateauTargetMet;
  result.capacity500Confirmed = null; // Natijalar verifikatsiyasi va real staging dalili alohida talab qilinadi.
  await writeFile(prefix + '.analysis.json', JSON.stringify(result, null, 2));
  return result;
}
if (process.argv[1]?.endsWith('analyze.mjs'))
  console.log(JSON.stringify(await analyze(process.argv[2]), null, 2));
