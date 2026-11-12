// Savollar bazasidagi aniq dublikatlarni ajratadi va tanlanadigan miqdorni tekshiradi.
import { createHash } from 'node:crypto';
import { fail } from './http.mjs';
const normalize = (value) => value.replace(/\s+/g, ' ').trim();
export function uniqueQuestionBank(questions) {
  const seen = new Map(),
    pool = [];
  questions.forEach((question, index) => {
    const key = JSON.stringify([normalize(question.q), question.options.map(normalize).sort()]);
    const correct = normalize(question.options[question.answer]);
    const previous = seen.get(key);
    if (previous) {
      if (previous.correct !== correct)
        fail("Bir xil savolda turli to'g'ri javoblar belgilangan. Bazani tekshiring.");
      return;
    }
    seen.set(key, { correct });
    pool.push({ index, key });
  });
  return pool;
}
export function validateQuestionBank(questions, settings, testType) {
  if (!settings.questionsPerAttempt) return;
  if (testType !== 'ordinary' || questions.some((q) => q.section))
    fail('Bazadan savol tanlash faqat oddiy test uchun ishlaydi.');
  const pool = uniqueQuestionBank(questions);
  if (settings.questionsPerAttempt > pool.length)
    fail(
      'Bazadagi takrorlanmagan savollar ' +
        pool.length +
        ' ta. ' +
        settings.questionsPerAttempt +
        " ta savol tanlab bo'lmaydi."
    );
}
export function questionBankKey(test, pool) {
  return (
    test.id +
    '/' +
    createHash('sha256')
      .update(JSON.stringify([test.settings.questionsPerAttempt, pool.map((q) => q.key)]))
      .digest('hex')
  );
}
export const displayedQuestionCount = (test) => test.settings?.questionsPerAttempt || test.questions.length;
