// Tasdiqlangan mavzu miqdorlaridan o'zgarmas savol nusxali qoralama tuzadi.
import { randomUUID, randomInt } from 'node:crypto';
import { sampleTopics } from '../lib/topic-sampler.mjs';
import { compositionValid } from '../lib/quarter-composition.mjs';
import { findTopic } from './topic-service.mjs';
import * as tests from '../repositories/tests-repo.mjs';
import { currentAccess } from '../lib/access-context.mjs';
import { questionsValid, integer, string, settingsValid } from '../lib/validate.mjs';
import { uniqueQuestionBank } from '../lib/question-bank.mjs';
import { fail } from '../lib/http.mjs';
export async function composeQuarter(input) {
  if (!Array.isArray(input.topics) || !input.topics.length || input.topics.length > 40)
    fail('1-40 ta mavzu tanlang.');
  if (new Set(input.topics.map((t) => t.id)).size !== input.topics.length) fail('Mavzu takrorlanmasin.');
  const topics = await Promise.all(input.topics.map((t) => findTopic(t.id)));
  if (
    topics.some(
      (t) => t.grade !== topics[0].grade || t.subject !== topics[0].subject || t.quarter !== topics[0].quarter
    )
  )
    fail("Sinf, fan va chorak bir xil bo'lsin.");
  const choices = input.topics.map((t, i) => ({
    topic: topics[i],
    count: integer(t.count, 'Miqdor', 1, 200),
  }));
  if (choices.reduce((sum, t) => sum + t.count, 0) > 200) fail('Jami 200 tadan oshmasin.');
  const ordered = sampleTopics(choices);
  return {
    title: `${topics[0].subject}: ${topics[0].quarter}-chorak`,
    subject: topics[0].subject,
    topics: input.topics,
    questions: questionsValid(ordered.map((q) => q.question)),
    sources: ordered.map(({ question, ...s }) => s),
  };
}
export async function saveQuarter(input) {
  const now = new Date().toISOString();
  const questions = questionsValid(input.questions);
  if (uniqueQuestionBank(questions).length !== questions.length) fail('Testda savol takrorlanmasin.');
  const composition = compositionValid(input, questions.length);
  const topics = await Promise.all(composition.topics.map((t) => findTopic(t.id)));
  if (
    topics.some(
      (t) => t.grade !== topics[0].grade || t.subject !== topics[0].subject || t.quarter !== topics[0].quarter
    )
  )
    fail("Sinf, fan va chorak bir xil bo'lsin.");
  composition.topics.forEach((t, i) => {
    t.name = topics[i].name;
  });
  composition.sources.forEach((s, i) => {
    const source = topics
      .find((t) => t.id === s.topicId)
      .questions.find((q) => q.id === s.questionId && !q.archived);
    if (!source || JSON.stringify(questionsValid([source])[0]) !== JSON.stringify(questions[i]))
      fail('Mavzu savoli yangilangan. Qoralamani qayta tuzing.', 409);
  });
  const test = {
    id: randomUUID(),
    schoolId: currentAccess().schoolId,
    title: string(input.title, 'Test nomi', 100),
    subject: string(input.subject, 'Fan', 100),
    questions,
    settings: settingsValid(),
    classIds: [],
    grades: [],
    testType: 'ordinary',
    direction: '',
    active: false,
    schedule: { start: null, end: null },
    created: now,
    createdAt: now,
    updated: now,
    origin: { type: 'school' },
    composition,
  };
  await tests.create(test);
  return { id: test.id };
}
export async function replaceQuarterQuestion(input) {
  const topic = await findTopic(input.topicId);
  const excluded = new Set(input.excluded || []);
  const pool = topic.questions.filter((q) => !q.archived && !excluded.has(q.id));
  if (!pool.length) fail('Shu mavzuda boshqa savol qolmadi.', 409);
  const q = pool[randomInt(pool.length)];
  return { question: questionsValid([q])[0], source: { topicId: topic.id, questionId: q.id } };
}
