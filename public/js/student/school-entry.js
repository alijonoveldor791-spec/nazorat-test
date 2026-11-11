// Kirish kodlarining server tekshiruvi, eski javobni bekor qilish va start adapteri.
import { browserKey } from './test-state.js';
import { $ } from '../core/dom.js';
import { api } from '../core/api-client.js';
export function createSchoolEntry(onInvalidate) {
  let verified = null,
    generation = 0,
    controller;
  const values = () => ({
    public_school_id: $('public-school-id').value.trim().toUpperCase(),
    testCode: $('test-code').value,
    browserKey: browserKey(),
  });
  const isVerified = () => verified && JSON.stringify(verified.codes) === JSON.stringify(values());
  function invalidate() {
    generation++;
    controller?.abort();
    verified = null;
    onInvalidate();
  }
  for (const id of ['public-school-id', 'test-code']) $(id).addEventListener('input', invalidate);
  const queryId = new URLSearchParams(location.search).get('schoolId');
  if (/^SK-[1-9][0-9]{3,15}$/i.test(queryId || '')) $('public-school-id').value = queryId.toUpperCase();
  return {
    isVerified,
    getData: () => (isVerified() ? verified.data : null),
    async resolve() {
      controller?.abort();
      controller = new AbortController();
      const current = ++generation,
        codes = values();
      verified = null;
      let data;
      try {
        data = await api('school-entry/resolve', {
          method: 'POST',
          body: JSON.stringify(codes),
          signal: controller.signal,
        });
      } catch (error) {
        if (current !== generation) return null;
        throw error;
      }
      if (current !== generation || JSON.stringify(codes) !== JSON.stringify(values())) return null;
      if (!data.classes?.length)
        throw new Error("Bu test uchun sinf yoki guruh topilmadi. O'qituvchingizga murojaat qiling.");
      $('public-school-id').value = data.school.public_school_id;
      verified = { codes: values(), data };
      return data;
    },
    async start(identity) {
      if (!isVerified()) throw new Error('Avval maktab va test kodini qayta tekshiring.');
      return api('school-entry/start', {
        method: 'POST',
        body: JSON.stringify({ ...identity, ...verified.codes }),
      });
    },
  };
}
