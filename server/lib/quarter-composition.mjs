// Test nusxasidagi mavzu kvotalari va savol manbalari shartnomasini tekshiradi.
import { string, integer } from './validate.mjs';
import { fail } from './http.mjs';
export function compositionValid(value, questionCount) {
  if (
    !Array.isArray(value?.topics) ||
    !value.topics.length ||
    value.topics.length > 40 ||
    !Array.isArray(value.sources) ||
    value.sources.length !== questionCount
  )
    fail('Mavzu miqdorlari va savol manbalari kerak.');
  const topics = value.topics.map((t) => ({
    id: string(t.id, 'Mavzu ID', 100),
    name: string(t.name || t.id, 'Mavzu', 160),
    count: integer(t.count, 'Miqdor', 1, 200),
  }));
  if (
    new Set(topics.map((t) => t.id)).size !== topics.length ||
    topics.reduce((n, t) => n + t.count, 0) !== questionCount
  )
    fail('Mavzu miqdorlari testga mos emas.');
  const sources = value.sources.map((s) => ({
    topicId: string(s.topicId, 'Mavzu ID', 100),
    questionId: string(s.questionId, 'Savol ID', 100),
  }));
  if (
    sources.some((s) => !topics.some((t) => t.id === s.topicId)) ||
    topics.some((t) => sources.filter((s) => s.topicId === t.id).length !== t.count)
  )
    fail('Savol manbalari miqdorlarga mos emas.');
  return { topics, sources };
}
