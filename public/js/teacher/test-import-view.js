// Test muharriri va mavzular bazasi uchun yagona Word import maydonlari.
export const renderTestImport = () => `<div class="file-drop stack">
<label>Word hujjati (.doc yoki .docx)<input id="import-file" type="file" accept=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"></label>
<button type="button" id="preview" class="btn secondary">Word faylni tahlil qilish va ko'rib chiqish</button>
<p id="preview-error" class="error" role="alert"></p></div>`;
