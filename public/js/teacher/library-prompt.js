// Mavzu bo'yicha Word import formatiga mos nusxalanadigan AI promptini tayyorlaydi.
import { modal } from '../components/modal.js';
import { esc } from '../core/dom.js';
import { copyText } from '../core/clipboard.js';
export async function topicPrompt(topic) {
  const fields = await modal(
    'Prompt tayyorlash',
    `<form class="stack">
    <label>Savollar soni<input id="prompt-count" type="number" min="1" max="200" value="20" required></label>
    <label>Qiyinlik<select id="prompt-level"><option>Oson</option><option>O'rtacha</option><option>Qiyin</option></select></label></form>`
  );
  if (!fields) return;
  const text = `${topic.grade}-sinf, ${topic.subject} fani, ${topic.quarter}-chorak, "${topic.name}" mavzusi bo'yicha ${fields.querySelector('#prompt-count').value} ta ${fields.querySelector('#prompt-level').value.toLowerCase()} darajadagi savoldan iborat, yuklashga tayyor DOCX fayl yarating.
Savollarni 1 dan ketma-ket raqamlang. Har savolda A., B., C., D. variantlari alohida qatorda yozilsin. Aynan bitta to'g'ri variant boshiga # qo'ying, masalan #B. Noto'g'ri variantlarda # bo'lmasin. Alohida javoblar kaliti yoki kirish matni qo'shmang. Formulalar Word formulasi sifatida, rasmlar va jadvallar savol ichida saqlansin. O'qituvchi tekshirganidan keyin fayl import qilinadi.`;
  await modal('Nusxalashga tayyor prompt', `<textarea rows="12" readonly>${esc(text)}</textarea>`, {
    confirm: 'Nusxalash',
    onConfirm: () => copyText(text),
  });
}
