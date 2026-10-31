// Aiken faylni o’qiydi; preview parserini faqat serverda chaqiradi.
import { post } from './teacher-api.js';
import { toast } from '../components/toast.js';
import { busy } from '../core/busy.js';
import { confirmAction } from '../components/modal.js';
export function bindTestImport(dialog, onQuestions, hasQuestions = () => false) {
  dialog.querySelector('#import-file').onchange = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
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
            'Previewdagi savollar hozir tahrirlangan savollar o’rniga qo’yiladi.'
          ))
        )
          return;
        const result = await post('tests/preview', { text: dialog.querySelector('#import-text').value });
        onQuestions(result.questions);
        toast(`${result.questions.length} savol tekshirildi. Pastda ko’rib chiqing.`);
      } catch (error) {
        err.textContent = error.message;
      }
    });
}
