// Faqat legacy sinfdagi avval saqlangan shaxsiy kodlarni ko'rsatadi.
import { data } from './data.js';
import { esc } from '../core/dom.js';
import { modal } from '../components/modal.js';
export async function showStudentCodes(id) {
  const cls = data.classes.find((row) => row.id === id);
  if (!cls || cls.schoolId) return;
  const students = cls.students.filter((student) => student.accessCode);
  if (!students.length) return;
  await modal(
    cls.name + ' — shaxsiy kirish kodlari',
    `<p>Faqat avval saqlangan legacy kodlar. Yangi shaxsiy kod yaratilmaydi. Har bir kodni faqat tegishli o'quvchiga bering.</p><div class="table-wrap"><table><thead><tr><th>O'quvchi</th><th>Shaxsiy kod</th></tr></thead><tbody>${students.map((s) => `<tr><td>${esc(s.surname + ' ' + s.name)}</td><td><code>${esc(s.accessCode)}</code></td></tr>`).join('')}</tbody></table></div>`,
    { confirm: '', cancel: 'Yopish' }
  );
}
