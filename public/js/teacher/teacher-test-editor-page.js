// Sahifaning holati va ko'rinish qismlarini birlashtiradi.
import { part0 } from './teacher-test-editor-page/part-0.js';
import { part1 } from './teacher-test-editor-page/part-1.js';
import { part2 } from './teacher-test-editor-page/part-2.js';
export function TeacherTestEditorPage() {
  const scope = {};
  let result;
  result = part0(scope);
  if (result?.done) return result.value;
  result = part1(scope);
  if (result?.done) return result.value;
  result = part2(scope);
  if (result?.done) return result.value;
}
