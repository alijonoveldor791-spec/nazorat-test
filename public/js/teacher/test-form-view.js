// Test sozlamalari va import maydonlarining markupini chizadi.
import { esc } from '../core/dom.js';
export function renderTestForm(t, classes) {
  const dateInput = (v) => (v ? new Date(Date.parse(v) + 5 * 3600000).toISOString().slice(0, 16) : '');
  return `<form id="test-editor" class="stack">
<label>Test nomi<input id="edit-title" required maxlength="100" value="${esc(t.title)}" placeholder="1-Nazorat ishi">
</label>
<label>Fan<input id="edit-subject" maxlength="100" value="${esc(t.subject || '')}" placeholder="Masalan, matematika"></label>
<p class="help">Saqlanganda maktab testiga umumiy 6 xonali kod beriladi. Uni testlar ro'yxatida ko'rasiz.</p>
<fieldset>
<legend>Sinflar</legend>
<div class="row">${classes
    .map(
      (c) => `<label class="check">
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
<label>Aiken .txt fayl<input id="import-file" type="file" accept=".txt,text/plain">
</label>
<label>Yoki Aiken matni<textarea id="import-text" placeholder="Savol matni&#10;A. Birinchi variant&#10;B. Ikkinchi variant&#10;ANSWER: A">
</textarea>
</label>
<button type="button" id="preview" class="btn secondary">Ko'rib chiqish va tahrirlagichga olish</button>
<a href="/namuna-test.txt" download>20 savollik namuna fayl</a>
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
