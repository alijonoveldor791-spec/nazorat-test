// Saqlangan testning onlayn berilishi, ruxsatli eksporti va umumiy bankka yuborilishini ulaydi.
import { modal } from '../components/modal.js';
import { esc } from '../core/dom.js';
import { call, post } from './teacher-api.js';
import { getToken } from '../core/auth.js';
import { copyText } from '../core/clipboard.js';
export async function publishTest(id) {
  const classes = await call('classes');
  let result;
  const approved = await modal(
    'Onlayn berish',
    `<form class="stack">
    <label>Sinf yoki guruh<select id="online-class">${classes.map((c) => `<option value="${esc(c.id)}">${esc(c.name)}</option>`).join('')}</select></label>
    <label>Vaqt (daqiqa)<input id="online-time" type="number" min="0" max="240" value="30" required></label>
    <label>Urinishlar<input id="online-attempts" type="number" min="1" max="100" value="1" required></label>
    <label><input id="online-shuffle-q" type="checkbox"> Savollarni aralashtirish</label>
    <label><input id="online-shuffle-o" type="checkbox"> Variantlarni aralashtirish</label></form>`,
    {
      onConfirm: async (d) => {
        const classId = d.querySelector('#online-class').value;
        result = await post(`tests/${id}/publish`, {
          classIds: [classId],
          direction: classes.find((c) => c.id === classId)?.direction || '',
          settings: {
            timeLimitMin: +d.querySelector('#online-time').value,
            maxAttempts: +d.querySelector('#online-attempts').value,
            shuffleQuestions: d.querySelector('#online-shuffle-q').checked,
            shuffleOptions: d.querySelector('#online-shuffle-o').checked,
          },
        });
      },
    }
  );
  if (approved)
    await modal(
      'Test kodi',
      `<p>Umumiy kod: <strong>${esc(result.testCode.value)}</strong></p>
    <p>O'quvchilar maktab IDsi va ushbu kod orqali kiradi.</p>`,
      {
        confirm: 'Kodni nusxalash',
        onConfirm: () => copyText(result.testCode.value),
      }
    );
}
export async function downloadTest(id, format, shared = false) {
  const response = await fetch(
    `/api/admin/${shared ? 'shared-tests' : 'tests'}/${id}/document?format=${format}`,
    {
      headers: { Authorization: 'Bearer ' + getToken() },
      cache: 'no-store',
    }
  );
  if (!response.ok) throw new Error((await response.json()).error);
  const content =
    format === 'pdf'
      ? new Blob(
          [
            (await response.text())
              .replaceAll('href="/', `href="${location.origin}/`)
              .replaceAll('src="/', `src="${location.origin}/`),
          ],
          { type: 'text/html' }
        )
      : await response.blob();
  const url = URL.createObjectURL(content);
  if (format === 'pdf') {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.click();
  } else {
    const a = document.createElement('a');
    a.href = url;
    a.download = format === 'key' ? 'javoblar-kaliti.docx' : 'test.docx';
    a.click();
  }
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
