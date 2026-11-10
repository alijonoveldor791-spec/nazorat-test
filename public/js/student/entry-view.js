// Wizard ko'rinishi, maydon xatolari va escape qilingan yakuniy ma'lumotlar.
import { $, esc } from '../core/dom.js';
const STEPS = [
  ['Maktab va test kodi', "O'qituvchingiz bergan maktab IDsi va 6 xonali test kodini kiriting."],
  [
    'Sinf yoki guruhingizni tanlang',
    "Faqat shu testga biriktirilgan sinf yoki guruhlardan o'z sinf yoki guruhingizni tanlang.",
  ],
  ["O'zingizni tanishtiring", "Natijangiz to'g'ri ko'rinishi uchun ism va familiyangizni kiriting."],
  ['Boshlashga tayyormisiz?', "Ma'lumotlarni tekshiring. Tuzatish uchun orqaga qaytishingiz mumkin."],
];
const ERROR_IDS = {
  'public-school-id': 'school-error',
  'test-code': 'code-error',
  grade: 'class-error',
  name: 'name-error',
  'father-name': 'father-name-error',
  surname: 'surname-error',
};
export function fieldError(id, message = '') {
  $(ERROR_IDS[id]).textContent = message;
  $(id).setAttribute('aria-invalid', String(Boolean(message)));
}
export function clearFieldErrors() {
  Object.keys(ERROR_IDS).forEach((id) => fieldError(id));
}
export function validateCodes() {
  const code = $('public-school-id').value.trim().toUpperCase();
  const schoolValid = /^SK-[1-9][0-9]{3,15}$/.test(code) && Number.isSafeInteger(Number(code.slice(3)));
  const codeValid = /^[0-9]{6}$/.test($('test-code').value);
  fieldError('public-school-id', schoolValid ? '' : "Maktab IDsini SK-1001 ko'rinishida kiriting.");
  fieldError('test-code', codeValid ? '' : "Test kodi aniq 6 ta raqamdan iborat bo'lsin.");
  if (!schoolValid || !codeValid) $(schoolValid ? 'test-code' : 'public-school-id').focus();
  return schoolValid && codeValid;
}
export function validateIdentity() {
  let first;
  for (const [id, label] of [
    ['name', 'Ism'],
    ['father-name', 'Otasining ismi'],
    ['surname', 'Familiya'],
  ]) {
    const value = $(id).value.trim();
    const message = !value ? label + ' kiritilishi shart.' : value.length > 60 ? '60 belgidan oshmasin.' : '';
    fieldError(id, message);
    if (message) first ||= id;
  }
  if ($('name').value.trim().length + $('father-name').value.trim().length + 1 > 60) {
    fieldError('father-name', 'Ism va otasining ismi birgalikda 60 belgidan oshmasin.');
    first ||= 'father-name';
  }
  if (first) $(first).focus();
  return !first;
}
export function showStep(step, focus = true) {
  document.querySelectorAll('.wizard-step').forEach((node) => {
    node.hidden = Number(node.dataset.step) !== step;
    node.disabled = node.hidden;
  });
  document.querySelectorAll('.entry-progress li').forEach((node, index) => {
    node.classList.toggle('is-complete', index + 1 < step);
    if (index + 1 === step) node.setAttribute('aria-current', 'step');
    else node.removeAttribute('aria-current');
  });
  $('wizard-title').textContent = STEPS[step - 1][0];
  $('step-description').textContent = STEPS[step - 1][1];
  $('step-count').textContent = `${step} / 4 bosqich`;
  $('entry-back').hidden = step === 1;
  $('entry-next').textContent = step === 4 ? 'Testni boshlash' : 'Keyingi';
  $('entry-error').textContent = '';
  if (focus) $('wizard-title').focus();
}
export function summary(data) {
  const cls = data.classes.find((row) => row.id === $('grade').value);
  const rows = [
    ['Maktab', data.school.name],
    ['Maktab IDsi', data.school.public_school_id],
    [cls?.kind === 'group' ? 'Guruh' : 'Sinf', cls?.name],
    ['Ism', $('name').value.trim()],
    ['Familiya', $('surname').value.trim()],
    ['Otasining ismi', $('father-name').value.trim()],
    ['Test', data.test.title],
    ['Savollar soni', data.test.count],
    [
      'Davomiyligi',
      data.test.settings.timeLimitMin ? data.test.settings.timeLimitMin + ' daqiqa' : 'Vaqt cheklanmagan',
    ],
  ];
  $('entry-summary').innerHTML = rows
    .map(([label, value]) => `<div><dt>${label}</dt><dd>${esc(value)}</dd></div>`)
    .join('');
}
