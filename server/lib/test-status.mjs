// lib/test-status.mjs: serverdagi shu qatlam vazifasi.
import { displayedQuestionCount } from './question-bank.mjs';
export function status(test, now = Date.now()) {
  if (!test.active) return 'paused';
  if (test.schedule?.end && Date.parse(test.schedule.end) <= now) return 'ended';
  if (test.schedule?.start && Date.parse(test.schedule.start) > now) return 'scheduled';
  return 'active';
}
export function testMeta(t) {
  const { questions, ...rest } = t;
  return { ...rest, count: displayedQuestionCount(t), bankCount: questions.length, status: status(t) };
}
