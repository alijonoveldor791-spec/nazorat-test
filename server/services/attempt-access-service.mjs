// Urinish tokeni va brauzer egasini tekshiradi; tiklash tokeni baholash muddatini uzaytirmaydi.
import { verify } from '../lib/auth-token.mjs';
import { secret } from '../lib/env.mjs';
import { hash } from '../lib/identity.mjs';
import { fail } from '../lib/http.mjs';
import * as attemptsRepo from '../repositories/attempts-repo.mjs';
import { runWithAccess } from '../lib/access-context.mjs';
export function withAttemptScope(payload, action) {
  const claim = verify(payload.attemptToken, secret(), 'attempt', 0);
  const scope = claim.schoolId ? { role: 'school_student', schoolId: claim.schoolId } : null;
  return runWithAccess(scope, action);
}
export const endTime = (attempt) => (attempt.deadline ? Date.parse(attempt.deadline) : attempt.expires);
export const recoveryEnds = (attempt) =>
  Math.min(attempt.tokenExpires || Infinity, endTime(attempt) + 7 * 86400000);
export function scheduledAttempt(attempt, test) {
  const end = test?.schedule?.end ? Date.parse(test.schedule.end) : Infinity;
  return end < endTime(attempt) ? { ...attempt, deadline: new Date(end).toISOString() } : attempt;
}
export async function accessAttempt(payload, { includeQuestions = true } = {}) {
  const claim = verify(payload.attemptToken, secret(), 'attempt', 0);
  if (claim.exp < Date.now() - 7 * 86400000 || typeof claim.id !== 'string')
    fail('Urinishning tiklash muddati tugagan.', 401);
  const attempt = await (includeQuestions ? attemptsRepo.find(claim.id) : attemptsRepo.findState(claim.id));
  if (!attempt) fail('Urinish topilmadi.', 404);
  if (Date.now() > recoveryEnds(attempt)) fail('Urinishning tiklash muddati tugagan.', 401);
  if (attempt.ownerHash && attempt.ownerHash !== hash(String(payload.browserKey || '')))
    fail('Urinish boshqa brauzerga tegishli.', 403);
  return attempt;
}
