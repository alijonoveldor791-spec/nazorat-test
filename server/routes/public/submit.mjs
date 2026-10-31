// Yuborish so’rovini baholash xizmatiga uzatadi.
import { route } from '../../lib/route.mjs';
import { submitAttempt } from '../../services/scoring-service.mjs';
import { saveDraft, resumeAttempt } from '../../services/draft-service.mjs';
export const routes = [
  route('POST', '/submit', async ({ body, ip }) => submitAttempt(await body(), ip)),
  route('POST', '/attempts/draft', async ({ body, ip }) => saveDraft(await body(), ip)),
  route('POST', '/attempts/resume', async ({ body, ip }) => resumeAttempt(await body(), ip)),
];
