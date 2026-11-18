// Sahifaning holati va ko'rinish qismlarini birlashtiradi.
import { part0 } from './result-page/part-0.js';
export function ResultPage() {
  const scope = {};
  let result;
  result = part0(scope);
  if (result?.done) return result.value;
}
