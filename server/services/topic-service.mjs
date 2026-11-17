// Maktabning chorak mavzulari, qo'shimcha import va versiyali savol tahririni boshqaradi.
import { randomUUID } from 'node:crypto';
import * as repo from '../repositories/library-repo.mjs';
import { currentAccess, requireRole } from '../lib/access-context.mjs';
import { string, integer, questionsValid } from '../lib/validate.mjs';
import { fail } from '../lib/http.mjs';
import { uniqueQuestionBank } from '../lib/question-bank.mjs';
export async function findTopic(id) {
  const row = await repo.topic(id);
  if (!row) fail('Mavzu topilmadi.', 404);
  return row;
}
export async function listTopics() {
  return (await repo.topics()).map(({ questions, ...row }) => ({
    ...row,
    count: uniqueQuestionBank(questions.filter((q) => !q.archived)).length,
  }));
}
export async function createTopic(input) {
  requireRole(currentAccess(), ['school_admin']);
  const row = {
    id: randomUUID(),
    schoolId: currentAccess().schoolId,
    grade: string(input.grade, 'Sinf', 60),
    subject: string(input.subject, 'Fan', 100),
    quarter: integer(input.quarter, 'Chorak', 1, 4),
    name: string(input.name, 'Mavzu', 160),
    questions: [],
    version: 1,
  };
  await repo.createTopic(row);
  return row;
}
export async function appendQuestions(id, input) {
  await findTopic(id);
  const questions = questionsValid(input.questions).map((q) => ({ ...q, id: randomUUID(), archived: false }));
  return repo.updateTopic(id, (row) => {
    if (!row) fail('Mavzu topilmadi.', 404);
    if (row.version !== input.version) fail('Mavzu yangilangan. Qayta yuklang.', 409);
    if (row.questions.length + questions.length > 2000) fail('Mavzuda 2000 tadan ortiq savol mumkin emas.');
    uniqueQuestionBank([...row.questions.filter((q) => !q.archived), ...questions]);
    return { ...row, questions: [...row.questions, ...questions], version: row.version + 1 };
  });
}
export async function editTopicQuestion(id, input) {
  await findTopic(id);
  const question = input.question ? questionsValid([input.question])[0] : null;
  return repo.updateTopic(id, (row) => {
    if (!row || !row.questions.some((q) => q.id === input.questionId)) fail('Savol topilmadi.', 404);
    if (row.version !== input.version) fail('Mavzu yangilangan. Qayta yuklang.', 409);
    return {
      ...row,
      version: row.version + 1,
      questions: row.questions.map((q) =>
        q.id !== input.questionId ? q : { ...(question || q), id: q.id, archived: input.archived === true }
      ),
    };
  });
}
