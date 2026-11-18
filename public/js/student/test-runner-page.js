// Sahifaning holati va ko'rinish qismlarini birlashtiradi.
import { part0 } from './test-runner-page/part-0.js';
import { part1 } from './test-runner-page/part-1.js';
import { part2 } from './test-runner-page/part-2.js';
import { part3 } from './test-runner-page/part-3.js';
import { part4 } from './test-runner-page/part-4.js';
export function TestRunnerPage() {
  const scope = {};
  let result;
  result = part0(scope);
  if (result?.done) return result.value;
  result = part1(scope);
  if (result?.done) return result.value;
  result = part2(scope);
  if (result?.done) return result.value;
  result = part3(scope);
  if (result?.done) return result.value;
  result = part4(scope);
  if (result?.done) return result.value;
}
