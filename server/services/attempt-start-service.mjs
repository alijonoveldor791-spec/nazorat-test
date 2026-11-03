// Start limiti va idempotent rezervni instansiyalararo CAS bilan kelishtiradi.
import * as starts from '../repositories/attempt-starts-repo.mjs';
import * as attempts from '../repositories/attempts-repo.mjs';
import * as results from '../repositories/results-repo.mjs';
import * as retakes from '../repositories/retakes-repo.mjs';
import { currentAccess } from '../lib/access-context.mjs';
import { hash, norm } from '../lib/identity.mjs';
import { fail } from '../lib/http.mjs';
import { completeAttempt } from './completion-service.mjs';

async function initialState(test, who) {
  const previous = await attempts.listForIdentity(who.key);
  const legacy =
    currentAccess()?.role === 'school_student'
      ? []
      : (await results.list(true)).filter(
          (r) =>
            !previous.some((a) => a.id === r.attemptId) &&
            r.testId === test.id &&
            (r.classId === who.classId || norm(r.grade) === norm(who.grade)) &&
            norm(r.surname + ' ' + r.name) === norm(who.surname + ' ' + who.name)
        );
  const last = previous.find((a) => !a.finished && a.expires > Date.now());
  return starts.initialize(who.key, {
    sequence: previous.length,
    used: previous.length + legacy.length,
    last: last || null,
    requests: {},
  });
}
async function materialize(candidate, browserKey) {
  if (candidate.ownerHash !== hash(browserKey)) fail('Urinish boshqa brauzerga tegishli.', 409);
  let row = await attempts.find(candidate.id);
  if (!row) {
    await attempts.create(candidate);
    row = await attempts.find(candidate.id);
  }
  if (!row || row.ownerHash !== hash(browserKey)) fail('Urinishni tiklab bolmadi.', 409);
  return row;
}
export async function reserveAttempt(test, who, browserKey, requestId, build) {
  let state = (await starts.find(who.key)) || (await initialState(test, who));
  for (let index = 0; index < 30; index++) {
    const replayId = requestId && state.requests[requestId];
    if (replayId) {
      const row =
        state.last?.id === replayId
          ? await materialize(state.last, browserKey)
          : await attempts.find(replayId);
      if (!row || row.ownerHash !== hash(browserKey)) fail('Start dalili mos emas.', 409);
      return { attempt: row, created: false };
    }
    if (state.last) {
      const last = await materialize(state.last, browserKey);
      if (last.completion && !last.finished) await completeAttempt(last);
      if (
        !last.finished &&
        !last.completion &&
        last.expires > Date.now() &&
        !(await results.find(last.id.split('/').at(-1)))
      ) {
        if (requestId)
          await starts.update(who.key, (row) => ({
            ...row,
            requests: { ...row.requests, [requestId]: last.id },
          }));
        return { attempt: last, created: false };
      }
    }
    const grant = await retakes.find(who.key);
    const sequence = state.sequence;
    state = await starts.update(who.key, (row) => {
      if (row.sequence !== sequence) return row;
      if (row.used >= test.settings.maxAttempts + (grant?.extra || 0))
        fail("Topshirish limiti tugagan. O'qituvchingizdan ruxsat so'rang.", 403);
      const id = who.key + '/' + hash(who.key + ':start-v2:' + sequence).slice(0, 40);
      return {
        ...row,
        sequence: sequence + 1,
        used: row.used + 1,
        last: build(id),
        requests: { ...row.requests, ...(requestId ? { [requestId]: id } : {}) },
      };
    });
    if (state.sequence === sequence + 1) {
      // G'olib rezerv bitta; uni yozishga istalgan qayta so'rov yordam bera oladi.
      const attempt = await materialize(state.last, browserKey);
      if (requestId && !state.requests[requestId])
        await starts.update(who.key, (row) => ({
          ...row,
          requests: { ...row.requests, [requestId]: attempt.id },
        }));
      return { attempt, created: true };
    }
  }
  fail("Start holati o'zgardi. Qayta urinib ko'ring.", 409);
}
