// Mavzular orasidagi dublikatlarni kvotalarni buzmasdan qayta taqsimlab tanlaydi.
import { randomInt } from 'node:crypto';
import { uniqueQuestionBank } from './question-bank.mjs';
import { fail } from './http.mjs';
function shuffled(rows) {
  const result = [...rows];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
export function sampleTopics(choices) {
  const slots = [],
    assignment = new Map();
  uniqueQuestionBank(choices.flatMap(({ topic }) => topic.questions.filter((q) => !q.archived)));
  for (const { topic, count } of choices) {
    const available = topic.questions.filter((q) => !q.archived);
    const pool = shuffled(
      uniqueQuestionBank(available).map(({ index, key }) => ({ key, question: available[index] }))
    );
    if (pool.length < count)
      fail(`${topic.name}: ${count} ta so'raldi, ${pool.length} ta foydalanish mumkin.`, 409);
    for (let i = 0; i < count; i++) slots.push({ topic, pool, choice: null });
  }
  const allocate = (slot, seen) => {
    for (const candidate of slot.pool) {
      if (seen.has(candidate.key)) continue;
      seen.add(candidate.key);
      const previous = assignment.get(candidate.key);
      if (previous && !allocate(previous, seen)) continue;
      assignment.set(candidate.key, slot);
      slot.choice = candidate.question;
      return true;
    }
    return false;
  };
  for (const slot of slots) {
    if (allocate(slot, new Set())) continue;
    const requested = choices.find(({ topic }) => topic.id === slot.topic.id).count;
    const available = slots.filter((s) => s.topic.id === slot.topic.id && s.choice).length;
    fail(
      `${slot.topic.name}: ${requested} ta so'raldi, boshqa mavzulardagi takrorlarni hisobga olganda ${available} ta foydalanish mumkin.`,
      409
    );
  }
  return shuffled(
    slots.map(({ topic, choice }) => ({ question: choice, topicId: topic.id, questionId: choice.id }))
  );
}
