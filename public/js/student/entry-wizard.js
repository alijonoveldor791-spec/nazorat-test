// To'rt bosqichli kirish oqimi; URL va DOM qiymatlari server ruxsati o'rnini bosmaydi.
import { $, esc } from '../core/dom.js';
import { createSchoolEntry } from './school-entry.js';
import {
  showStep,
  fieldError,
  clearFieldErrors,
  validateCodes,
  validateIdentity,
  summary,
} from './entry-view.js';
import { beginEntry } from './entry-session.js';
export function initWizard() {
  document.querySelectorAll('.field-error').forEach((node) => node.setAttribute('aria-live', 'polite'));
  let step = 1,
    busy = false;
  const entry = createSchoolEntry(() => {
    $('entry-school').textContent = '';
    $('grade').innerHTML = '<option value="">Sinfingizni tanlang</option>';
    clearFieldErrors();
    if (step !== 1) {
      step = 1;
      showStep(step);
    }
    update();
  });
  function update() {
    $('entry-form').setAttribute('aria-busy', String(busy));
    $('entry-next').disabled = busy || (step === 1 && !entry.isVerified());
    $('entry-back').disabled = busy;
    $('resolve-entry').disabled = busy;
    $('public-school-id').readOnly = busy;
    $('test-code').readOnly = busy;
  }
  function selectedClass() {
    const valid = entry.getData()?.classes.some((row) => row.id === $('grade').value);
    fieldError('grade', valid ? '' : 'Davom etish uchun sinfingizni tanlang.');
    if (!valid) $('grade').focus();
    return valid;
  }
  $('resolve-entry').addEventListener('click', async () => {
    if (busy || step !== 1) return;
    $('entry-error').textContent = '';
    if (!validateCodes()) return;
    busy = true;
    $('entry-school').textContent = '';
    $('resolve-entry').textContent = 'Tekshirilmoqda...';
    update();
    try {
      const data = await entry.resolve();
      if (!data) return;
      $('grade').innerHTML =
        '<option value="">Sinfingizni tanlang</option>' +
        data.classes.map((row) => `<option value="${esc(row.id)}">${esc(row.name)}</option>`).join('');
      $('entry-school').textContent =
        data.school.name + ' · ' + data.school.public_school_id + ' · Kodlar tasdiqlandi';
    } catch (error) {
      $('entry-error').textContent = error.message;
    } finally {
      busy = false;
      $('resolve-entry').textContent = 'Kodlarni tekshirish';
      update();
    }
  });
  $('entry-back').addEventListener('click', () => {
    if (busy || step === 1) return;
    step--;
    showStep(step);
    update();
  });
  $('grade').addEventListener('change', () => fieldError('grade'));
  for (const id of ['name', 'father-name', 'surname']) $(id).addEventListener('input', () => fieldError(id));
  $('entry-form').addEventListener('submit', async (event) => {
    event.preventDefault();
    if (busy) return;
    if (!entry.isVerified()) {
      step = 1;
      showStep(step);
      $('entry-error').textContent = 'Avval maktab va test kodini tekshiring.';
      update();
      return;
    }
    if (step >= 2 && !selectedClass()) return;
    if (step >= 3 && !validateIdentity()) return;
    if (step < 4) {
      step++;
      if (step === 4) summary(entry.getData());
      showStep(step);
      update();
      return;
    }
    busy = true;
    update();
    $('entry-next').textContent = 'Boshlanmoqda...';
    $('entry-error').textContent = '';
    try {
      await beginEntry((browserKey) =>
        entry.start({
          classId: $('grade').value,
          name: `${$('name').value.trim()} ${$('father-name').value.trim()}`,
          surname: $('surname').value.trim(),
          browserKey,
        })
      );
    } catch (error) {
      $('entry-error').textContent = error.message;
    } finally {
      busy = false;
      $('entry-next').textContent = 'Testni boshlash';
      update();
    }
  });
  showStep(1, false);
  update();
}
