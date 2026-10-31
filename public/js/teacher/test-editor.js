// teacher/test-editor.js: sahifaning shu vazifasi uchun modul.

import { toast } from '../components/toast.js';

import { heading, action } from '../components/page-heading.js';
import { bootstrapPage } from './shell.js';
import { editTest } from './test-form.js';
bootstrapPage(
  'tests',
  () =>
    heading(
      'Test tahrirlagich',
      'Test nomi, sinflari va savollarini tayyorlang.',
      action('open-editor', 'Tahrirlagichni ochish')
    ),
  { 'open-editor': () => editTest(new URLSearchParams(location.search).get('id')) }
)
  .then((ready) => ready && editTest(new URLSearchParams(location.search).get('id')))
  .catch((error) => toast(error.message, true));
