// Sahifaning holati va ko'rinish qismlarini birlashtiradi.
import { part0 } from './teacher-library-page/part-0.js';
import { part1 } from './teacher-library-page/part-1.js';
import { part2 } from './teacher-library-page/part-2.js';
import { part3 } from './teacher-library-page/part-3.js';
import { part4 } from './teacher-library-page/part-4.js';
export function TeacherLibraryPage() {
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
