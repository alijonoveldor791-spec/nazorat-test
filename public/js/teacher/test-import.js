// Aiken faylni o\'qiydi; preview parserini faqat serverda chaqiradi.
import { post } from './teacher-api.js';
import { toast } from '../components/toast.js';
import { busy } from '../core/busy.js';
import { confirmAction } from '../components/modal.js';
export function bindTestImport(dialog, onQuestions, hasQuestions = () => false) {
  let selected = null;
  dialog.querySelector('#import-file').onchange = async (event) => {
    try {
      const file = event.target.files[0];
      selected = null;
      dialog.querySelector('#import-text').readOnly = false;
      dialog.querySelector('#import-text').value = '';
      if (!file) return;
      if (/\.docx$/i.test(file.name)) {
        if (file.size > 1_500_000) throw new Error('Word fayli 1,5 MB dan oshmasin.');
        selected = file;
        dialog.querySelector('#import-text').value = "Word fayli tanlandi. Ko'rib chiqish tugmasini bosing.";
        dialog.querySelector('#import-text').readOnly = true;
        return;
      }
      if (!/\.txt$/i.test(file.name)) throw new Error('Faqat .docx yoki .txt fayl tanlang.');
      if (file.size > 1_000_000) throw new Error('Fayl 1 MB dan oshmasin.');
      dialog.querySelector('#import-text').value = await file.text();
    } catch (error) {
      toast(error.message, true);
    }
  };
  dialog.querySelector('#preview').onclick = (event) =>
    busy(event.target, async () => {
      const err = dialog.querySelector('#preview-error');
      err.textContent = '';
      try {
        if (
          hasQuestions() &&
          !(await confirmAction(
            'Mavjud savollar almashtirilsinmi?',
            "Previewdagi savollar hozir tahrirlangan savollar o'rniga qo'yiladi."
          ))
        )
          return;
        dialog.querySelector('#import-file').disabled = true;
        let payload = { text: dialog.querySelector('#import-text').value };
        if (selected) {
          const docx = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result.split(',')[1]);
            reader.onerror = () => reject(new Error("Faylni o'qib bo'lmadi."));
            reader.readAsDataURL(selected);
          });
          payload = { docx };
        }
        const result = await post('tests/preview', payload);
        onQuestions(result.questions, result.sourceId || null);
        if (result.warnings?.length) err.textContent = result.warnings.join(' ');
        toast(`${result.questions.length} savol tekshirildi. Pastda ko\'rib chiqing.`);
      } catch (error) {
        err.textContent = error.message;
      } finally {
        dialog.querySelector('#import-file').disabled = false;
      }
    });
}
