// Sahifaning holati va ko'rinish qismlarini birlashtiradi.
import { part0 } from './landing-page/part-0.js';
export function LandingPage() {
  const scope = {};
  let result;
  result = part0(scope);
  if (result?.done) return result.value;
}
