// teacher/data.js: sahifaning shu vazifasi uchun modul.
import { call } from './teacher-api.js';
export let data = { classes: [], tests: [], results: [] };
export async function refresh() {
  const [classes, tests, results] = await Promise.all([call('classes'), call('tests'), call('results')]);
  data = { classes, tests, results };
  document.dispatchEvent(new Event('teacher:data'));
}
