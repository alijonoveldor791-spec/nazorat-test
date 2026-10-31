// teacher/test-editor.js: sahifaning shu vazifasi uchun modul.
import {$, esc} from '../core/dom.js';
import {toast} from '../components/toast.js';
import {modal, confirmAction} from '../components/modal.js';
import {empty} from '../components/empty-state.js';
import {busy} from '../core/busy.js';
import {percent, dateTime} from '../core/format.js';
import {download} from '../core/download.js';
import {data, refresh} from './data.js';
import {call, post} from './teacher-api.js';
import {heading, action} from '../components/page-heading.js';
import {bootstrapPage} from './shell.js';
import {editTest} from './test-form.js';
bootstrapPage('tests',()=>heading('Test tahrirlagich','Test nomi, sinflari va savollarini tayyorlang.',action('open-editor','Tahrirlagichni ochish')),
 {'open-editor':()=>editTest(new URLSearchParams(location.search).get('id'))}).then(()=>editTest(new URLSearchParams(location.search).get('id'))).catch(error=>toast(error.message,true));
