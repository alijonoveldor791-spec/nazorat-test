// teacher/test-editor.js: sahifaning shu vazifasi uchun modul.

import { toast } from '../components/toast.js';

import { heading, action } from '../components/page-heading.js';
import { bootstrapPage } from './shell.js';
import { editTest } from './test-form.js';
const testId = new URLSearchParams(location.search).get('id');
const pageTitle = testId ? 'Testni tahrirlash' : 'Yangi test yaratish';
document.title = `${pageTitle} — Nazorat`;
async function openEditor() {
  await editTest(testId);
  location.assign('/oqituvchi/testlar.html');
}
bootstrapPage(
  'tests',
  () =>
    heading(
      pageTitle,
      testId
        ? 'Test nomi, sinflari va savollarini yangilang.'
        : 'Test nomi, sinflari va savollarini kiriting.',
      action('open-editor', testId ? 'Testni tahrirlash' : 'Yangi test yaratish')
    ),
  { 'open-editor': openEditor }
)
  .then((ready) => ready && openEditor())
  .catch((error) => toast(error.message, true));
