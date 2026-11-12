// Oddiy testda bazadan olinadigan savollar miqdori va majburiy aralashtirishni boshqaradi.
export function bindQuestionBank(dialog, getQuestions) {
  const count = dialog.querySelector('#questions-per-attempt');
  const update = () => {
    const block = dialog.querySelector('#test-type').value === 'block';
    dialog.querySelector('#question-bank-label').hidden = block;
    dialog.querySelector('#question-bank-hint').hidden = block;
    count.disabled = block;
    count.max = Math.max(1, getQuestions().length);
    const sampled = !block && Number(count.value) > 0;
    const shuffle = dialog.querySelector('#shuffle-q');
    shuffle.disabled = sampled;
    dialog.querySelector('#shuffle-q-text').textContent = block
      ? "Har bir fan bo'limi ichida savollarni aralashtirish"
      : 'Savollarni aralashtirish';
    dialog.querySelector('#shuffle-q-hint').textContent = block
      ? "Masalan, 1-mutaxassislikning 30 ta savoli faqat o'z ichida aralashadi. Fanlar tartibi va savollar soni saqlanadi."
      : 'Har bir yangi urinish uchun savollar tartibi alohida tayyorlanadi.';
    if (sampled) shuffle.checked = true;
    dialog.querySelector('#question-bank-hint').textContent = sampled
      ? 'Bazada ' +
        getQuestions().length +
        ' savol. Har urinishga ' +
        count.value +
        ' ta takrorlanmagan savol turli tartibda beriladi.'
      : "0 bo'lsa barcha savollar beriladi. Masalan, Word bazasidagi 100 savoldan 30 tasini tanlash uchun 30 kiriting.";
  };
  count.addEventListener('input', update);
  dialog.querySelector('#test-type').addEventListener('change', update);
  update();
  return update;
}
