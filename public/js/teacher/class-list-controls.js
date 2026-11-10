// Sinf va guruh ko'rinishi, belgilash va tasdiqli ommaviy o'chirishni boshqaradi.
import { storage } from '../core/storage.js';
import { esc } from '../core/dom.js';
import { confirmAction } from '../components/modal.js';
import { toast } from '../components/toast.js';
import { call } from './teacher-api.js';
import { refresh } from './data.js';
const MODE_KEY = 'nazorat-class-list-mode';
const selected = new Set();
let mode = storage.get(MODE_KEY) === 'list' ? 'list' : 'cards';
let deleting = false;
export const listMode = () => mode;
export function chooseListMode(value) {
  mode = value === 'list' ? 'list' : 'cards';
  storage.set(MODE_KEY, mode);
}
export function listControls(classes) {
  for (const id of selected) if (!classes.some((t) => t.id === id)) selected.delete(id);
  return `<div class="row between class-list-controls">
  <div class="row" role="group" aria-label="Sinf va guruh ko'rinishi">
  <button class="btn secondary" data-action="view-cards" aria-pressed="${mode === 'cards'}">Kartalar</button>
  <button class="btn secondary" data-action="view-list" aria-pressed="${mode === 'list'}">Ro'yxat</button></div>
  <div class="row"><label class="check"><input id="select-all-classes" type="checkbox" ${classes.length && selected.size === classes.length ? 'checked' : ''} ${!classes.length || deleting ? 'disabled' : ''}>Ko'rsatilgan barchasini tanlash</label>
  <span id="class-selection-count" role="status">${selected.size} ta tanlandi</span>
  <button class="btn danger" data-action="delete-selected-classes" ${!selected.size || deleting ? 'disabled' : ''}>Tanlanganlarni o'chirish</button></div></div>`;
}
export function selectClasses(event, classes) {
  if (deleting) return;
  if (event.target.id === 'select-all-classes') {
    selected.clear();
    if (event.target.checked) classes.forEach((t) => selected.add(t.id));
  } else if (event.target.matches('[data-select-class]')) {
    const id = event.target.dataset.selectClass;
    if (classes.some((t) => t.id === id)) {
      if (event.target.checked) selected.add(id);
      else selected.delete(id);
    }
  }
}
export function selectionBox(cls) {
  return `<label class="check class-select"><input type="checkbox" data-select-class="${esc(cls.id)}" aria-label="${esc(cls.name)} sinf yoki guruhini tanlash" ${selected.has(cls.id) ? 'checked' : ''} ${deleting ? 'disabled' : ''}>Tanlash</label>`;
}
export function updateSelection(classes) {
  const all = document.getElementById('select-all-classes');
  if (!all) return;
  all.checked = classes.length > 0 && selected.size === classes.length;
  all.indeterminate = selected.size > 0 && selected.size < classes.length;
  document.getElementById('class-selection-count').textContent = `${selected.size} ta tanlandi`;
  document.querySelector('[data-action=delete-selected-classes]').disabled = !selected.size || deleting;
  document.querySelectorAll('[data-select-class]').forEach((input) => {
    input.checked = selected.has(input.dataset.selectClass);
    input.disabled = deleting;
  });
}
export async function deleteSelectedClasses(classes, assignedTests, draw) {
  if (deleting) return;
  const targets = classes.filter((t) => selected.has(t.id));
  if (!targets.length) return;
  if (
    !(await confirmAction(
      `${targets.length} ta sinf yoki guruh o'chirilsinmi?`,
      `${targets.map((t) => t.name).join(', ')}. ${assignedTests.filter((t) => t.classIds.some((id) => targets.some((c) => c.id === id))).length} ta testdan biriktirishlar olinadi. Testlar va eski natijalar saqlanadi.`
    ))
  )
    return;
  deleting = true;
  draw();
  let removed = 0,
    failed = null;
  try {
    for (const cls of targets) {
      try {
        await call('classes/' + cls.id, { method: 'DELETE' });
        selected.delete(cls.id);
        removed++;
      } catch (error) {
        failed = error;
      }
    }
    await refresh('classes');
    toast(
      `${removed} ta sinf yoki guruh o'chirildi.${failed ? " Ayrimlari o'chirilmadi: " + failed.message : ''}`,
      !!failed
    );
  } finally {
    deleting = false;
    draw();
  }
}
