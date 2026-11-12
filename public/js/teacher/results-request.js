// Natijalar sahifasining server so'rovlari va eksport paketlarini boshqaradi.
import { call } from './teacher-api.js';
import { setResults } from './data.js';
let controller,
  version = 0;
export const filters = { search: '', testId: '', classId: '', sort: 'time', page: 1 };
export const resultRequest = { ready: false, loading: true, message: '', total: 0, page: 1, pages: 1 };
export let overview = { counts: null, recent: [], catalogue: [], error: '' };
const notify = () => document.dispatchEvent(new Event('teacher:data'));
export function resultQuery(page = filters.page, pageSize = 20, selection = filters) {
  const query = new URLSearchParams({ page, pageSize, sort: selection.sort });
  for (const key of ['search', 'testId', 'classId']) if (selection[key]) query.set(key, selection[key]);
  return query;
}
export async function requestResults() {
  const current = ++version;
  controller?.abort();
  controller = new AbortController();
  Object.assign(resultRequest, { ready: false, loading: true, message: '' });
  setResults([]);
  try {
    const response = await call('results?' + resultQuery(), { signal: controller.signal });
    if (current !== version) return;
    Object.assign(resultRequest, response, { items: undefined, ready: true, loading: false });
    filters.page = response.page;
    setResults(response.items);
  } catch (error) {
    if (current !== version) return;
    Object.assign(resultRequest, { loading: false, message: error.message });
    setResults([]);
  }
}
export async function refreshOverview() {
  try {
    overview = { ...(await call('results/overview')), error: '' };
  } catch (error) {
    overview = { ...overview, error: error.message };
  }
  notify();
}
export async function collectResults(selection = { ...filters }) {
  const rows = [],
    ids = new Set();
  let page = 1,
    pages = 1;
  do {
    const batch = await call('results?' + resultQuery(page, 200, selection));
    if (batch.page !== page) break;
    for (const row of batch.items)
      if (!ids.has(row.id)) {
        ids.add(row.id);
        rows.push(row);
      }
    pages = batch.pages;
    page++;
  } while (page <= pages);
  return rows;
}
