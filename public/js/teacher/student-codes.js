// Shaxsiy o'quvchi kodlarini faqat admin ko'radi va tarqatadi.
import { data } from './data.js';
import { esc } from '../core/dom.js';
import { modal } from '../components/modal.js';
export async function showStudentCodes(id) {
  const cls = data.classes.find((row) => row.id === id);
  if (!cls) return;
  await modal(
    cls.name + ' — shaxsiy kirish kodlari',
    `<p>Har bir kodni faqat tegishli o'quvchiga bering. Umumiy guruhga yubormang.</p><div class="table-wrap"><table><thead><tr><th>O'quvchi</th><th>Shaxsiy kod</th></tr></thead><tbody>${cls.students.map((s) => `<tr><td>${esc(s.surname + ' ' + s.name)}</td><td><code>${esc(s.accessCode)}</code></td></tr>`).join('')}</tbody></table></div>`,
    { confirm: '', cancel: 'Yopish' }
  );
}
