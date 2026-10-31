// Yuborish so’rovini baholash xizmatiga uzatadi.
import {route} from '../../lib/route.mjs';
import {submitAttempt} from '../../services/scoring-service.mjs';
export const routes = [route('POST','/submit',async ({body,ip}) => submitAttempt(await body(),ip))];
