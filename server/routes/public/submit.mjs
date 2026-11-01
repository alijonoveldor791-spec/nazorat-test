// Yuborish so'rovini baholash xizmatiga uzatadi.
import { route } from '../../lib/route.mjs';
import { submitAttempt } from '../../services/scoring-service.mjs';
import { saveDraft, resumeAttempt } from '../../services/draft-service.mjs';
import { withAttemptScope } from '../../services/attempt-access-service.mjs';
const handle = async (body, ip, action) => {
  const payload = await body();
  return withAttemptScope(payload, () => action(payload, ip));
};
export const routes = [
  route('POST', '/submit', ({ body, ip }) => handle(body, ip, submitAttempt)),
  route('POST', '/attempts/draft', ({ body, ip }) => handle(body, ip, saveDraft)),
  route('POST', '/attempts/resume', ({ body, ip }) => handle(body, ip, resumeAttempt)),
];
