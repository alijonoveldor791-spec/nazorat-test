// Urinish uchun bazadan noyob savollar va server ajratgan yagona tartibni tayyorlaydi.
import { presentation } from '../lib/shuffle.mjs';
import { questionBankKey, uniqueQuestionBank, validateQuestionBank } from '../lib/question-bank.mjs';
import { permutationCount, uniqueQuestionOrder } from '../lib/unique-question-order.mjs';
import { reserveQuestionSet } from '../repositories/question-sets-repo.mjs';
export async function prepareAttemptQuestions(test, attemptId) {
  const take = test.settings.questionsPerAttempt || 0;
  if (!take) return { questions: presentation(test.questions, test.settings, attemptId) };
  validateQuestionBank(test.questions, test.settings, test.testType || 'ordinary');
  const pool = uniqueQuestionBank(test.questions);
  const reservation = await reserveQuestionSet(
    questionBankKey(test, pool),
    attemptId,
    permutationCount(pool.length, take)
  );
  const order = uniqueQuestionOrder(pool.length, take, reservation.ordinal, reservation.seed).map(
    (index) => pool[index].index
  );
  return {
    questions: presentation(test.questions, test.settings, attemptId, order),
    sourceQuestionCount: test.questions.length,
  };
}
