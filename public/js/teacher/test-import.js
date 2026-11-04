// Word faylni matn sifatida emas, serverdagi xavfsiz preview endpointiga yuboradi.
import { call } from './teacher-api.js';
import { toast } from '../components/toast.js';
import { busy } from '../core/busy.js';
import { confirmAction } from '../components/modal.js';
export function bindTestImport(dialog, onQuestions, hasQuestions = () => false) {
  let selectedFile = null;
  dialog.querySelector('#import-file').onchange = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) { selectedFile = null; return; }
      if (!/\.(doc|docx)$/i.test(file.name)) {
        event.target.value = '';
        selectedFile = null;
        throw new Error('DOC yoki DOCX Word hujjatini tanlang.');
      }
      if (file.size > 4_000_000) throw new Error('Word fayli 4 MB dan oshmasin.');
      selectedFile = file;
      dialog.querySelector('#preview-error').textContent = '';
    } catch (error) {
      toast(error.message, true);
    }
  };
  dialog.querySelector('#preview').onclick = (event) =>
    busy(event.target, async () => {
      const err = dialog.querySelector('#preview-error');
      err.textContent = '';
      try {
        if (!selectedFile) throw new Error('Avval .doc yoki .docx Word faylini tanlang.');
        const form = new FormData();
        form.append('file', selectedFile, selectedFile.name);
        const result = await call('tests/preview-document', { method: 'POST', body: form });
        if (hasQuestions() && !(await confirmAction('Mavjud savollar almashtirilsinmi?', "Previewdagi savollar hozir tahrirlangan savollar o'rniga qo'yiladi."))) return;
        onQuestions(result.questions);
        toast(`${result.questions.length} savol tahlil qilindi. Pastda ko'rib chiqing va tahrirlang.`);
        if (result.warnings?.length) err.textContent = result.warnings.map((warning) => warning.message).join(' ');
      } catch (error) {
        err.textContent = error.message;
      }
    });
}
