// Test sozlamalari va import maydonlarining markupini chizadi.
import { esc } from '../core/dom.js';
export function renderTestForm(t, classes) {
  const dateInput = (v) => (v ? new Date(Date.parse(v) + 5 * 3600000).toISOString().slice(0, 16) : '');
  return `<form id="test-editor" class="stack">
<label>Test nomi<input id="edit-title" required maxlength="100" value="${esc(t.title)}" placeholder="1-Nazorat ishi">
</label>
<label>Test turi<select id="test-type"><option value="ordinary" ${t.testType !== 'block' ? 'selected' : ''}>Oddiy test</option><option value="block" ${t.testType === 'block' ? 'selected' : ''}>Blok test</option></select></label>
<fieldset><legend>Kimlar uchun</legend><label class="check"><input type="checkbox" id="audience-class">Sinflar uchun</label><label class="check"><input type="checkbox" id="audience-group">Guruhlar uchun</label></fieldset>
<label id="subject-label">Fan nomi<input id="edit-subject" maxlength="100" value="${esc(t.subject || '')}" placeholder="Masalan, matematika"></label>
<p class="help">Saqlanganda maktab testiga umumiy 6 xonali kod beriladi. Uni testlar ro'yxatida ko'rasiz.</p>
<label id="test-direction-label">Yo'nalish nomi<select id="edit-direction"><option value="">Yo'nalishni tanlang</option>${[...new Set(classes.filter((c) => c.kind === 'group').map((c) => c.direction))].map((d) => `<option value="${esc(d)}" ${t.direction === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select></label>
<fieldset>
<legend>Sinf va guruhlar</legend>
<div class="row">${classes
    .map(
      (
        c
      ) => `<label class="check" data-audience="${esc(c.kind || 'class')}" data-direction="${esc(c.direction || '')}">
<input type="checkbox" name="classIds" value="${esc(c.id)}" ${t.classIds.includes(c.id) ? 'checked' : ''}>${esc(c.name)}</label>`
    )
    .join('')}</div>
</fieldset>
<div class="fields">
<label>Vaqt chegarasi (daqiqa, 0 — cheksiz)<input id="limit" type="number" min="0" max="240" value="${t.settings.timeLimitMin}" required>
</label>
<label>Urinishlar soni<input id="attempts" type="number" min="1" max="100" value="${t.settings.maxAttempts}" required>
</label>
<label>Boshlanish (Toshkent vaqti)<input id="schedule-start" type="datetime-local" value="${dateInput(t.schedule.start)}">
</label>
<label>Tugash (Toshkent vaqti)<input id="schedule-end" type="datetime-local" value="${dateInput(t.schedule.end)}">
</label>
</div>
<label class="check">
<input id="shuffle-q" type="checkbox" ${t.settings.shuffleQuestions ? 'checked' : ''}>Savollarni aralashtirish</label>
<label class="check">
<input id="shuffle-o" type="checkbox" ${t.settings.shuffleOptions ? 'checked' : ''}>Variantlarni aralashtirish</label>
<label class="check">
<input id="show-answers" type="checkbox" ${t.settings.showAnswers ? 'checked' : ''}>Yakunlangach to'g'ri javoblarni ko'rsatish</label>
<hr>
<div class="file-drop stack">
<label>Word hujjati (.doc yoki .docx)<input id="import-file" type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document">
</label>
<button type="button" id="preview" class="btn secondary">Word faylni tahlil qilish va ko'rib chiqish</button>
<p id="preview-error" class="error" role="alert">
</p>
</div>
<div class="row between">
<h3>Savollarni tahrirlash</h3>
<button type="button" class="btn secondary" id="add-question">+ Savol</button>
</div>
<div id="editor-questions" class="stack">
</div>
</form>`;
}
