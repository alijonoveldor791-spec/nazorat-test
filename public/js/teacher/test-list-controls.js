// Test ko'rinishi, belgilash holati va mavjud DELETE orqali ommaviy o'chirishni boshqaradi.
import { storage } from '../core/storage.js';
import { esc } from '../core/dom.js';
import { confirmAction } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { call } from './teacher-api.js';
import { refresh } from './data.js';
const MODE_KEY = 'nazorat-test-list-mode';
const selected = new Set();
let mode = storage.get(MODE_KEY) === 'list' ? 'list' : 'cards';
let deleting = false;
export const listMode = () => mode;
export function clearSelection() {
  selected.clear();
}
export function chooseListMode(value) {
  mode = value === 'list' ? 'list' : 'cards';
  storage.set(MODE_KEY, mode);
}
export function listControls(tests) {
  for (const id of selected) if (!tests.some((t) => t.id === id)) selected.delete(id);
  return `<div class="row between test-list-controls">
  <div class="row" role="group" aria-label="Test ko'rinishi">
  <button class="btn secondary" data-action="view-cards" aria-pressed="${mode === 'cards'}">Kartalar</button>
  <button class="btn secondary" data-action="view-list" aria-pressed="${mode === 'list'}">Ro'yxat</button></div>
  <div class="row"><label class="check"><input id="select-all-tests" type="checkbox" ${tests.length && selected.size === tests.length ? 'checked' : ''} ${!tests.length || deleting ? 'disabled' : ''}>Ko'rsatilgan barchasini tanlash</label>
  <span id="test-selection-count" role="status">${selected.size} ta tanlandi</span>
  <button class="btn danger" data-action="delete-selected-tests" ${!selected.size || deleting ? 'disabled' : ''}>Tanlanganlarni o'chirish</button></div></div>`;
}
export function selectTests(event, tests) {
  if (deleting) return;
  if (event.target.id === 'select-all-tests') {
    selected.clear();
    if (event.target.checked) tests.forEach((t) => selected.add(t.id));
  } else if (event.target.matches('[data-select-test]')) {
    const id = event.target.dataset.selectTest;
    if (tests.some((t) => t.id === id)) {
      if (event.target.checked) selected.add(id);
      else selected.delete(id);
    }
  }
}
export function selectionBox(test) {
  return `<label class="check test-select"><input type="checkbox" data-select-test="${esc(test.id)}" aria-label="${esc(test.title)} testini tanlash" ${selected.has(test.id) ? 'checked' : ''} ${deleting ? 'disabled' : ''}>Tanlash</label>`;
}
export function updateSelection(tests) {
  const all = document.getElementById('select-all-tests');
  if (!all) return;
  all.checked = tests.length > 0 && selected.size === tests.length;
  all.indeterminate = selected.size > 0 && selected.size < tests.length;
  document.getElementById('test-selection-count').textContent = `${selected.size} ta tanlandi`;
  document.querySelector('[data-action=delete-selected-tests]').disabled = !selected.size || deleting;
  document.querySelectorAll('[data-select-test]').forEach((input) => {
    input.checked = selected.has(input.dataset.selectTest);
    input.disabled = deleting;
  });
}
export async function deleteSelectedTests(tests, draw) {
  if (deleting) return;
  const targets = tests.filter((t) => selected.has(t.id));
  if (!targets.length) return;
  if (
    !(await confirmAction(
      `${targets.length} ta test o'chirilsinmi?`,
      `${targets.map((t) => t.title).join(', ')}. Eski natijalar saqlanadi. Boshlangan urinishlar yuborilmaydi.`
    ))
  )
    return;
  deleting = true;
  draw();
  let removed = 0,
    failed = null;
  try {
    for (const test of targets) {
      try {
        await call('tests/' + test.id, { method: 'DELETE' });
        selected.delete(test.id);
        removed++;
      } catch (error) {
        failed = error;
      }
    }
    await refresh('tests');
    toast(
      `${removed} ta test o'chirildi.${failed ? " Ayrim testlar o'chirilmadi: " + failed.message : ''}`,
      !!failed
    );
  } finally {
    deleting = false;
    draw();
  }
}
