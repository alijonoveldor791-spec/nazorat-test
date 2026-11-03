// lib/shuffle.mjs: serverdagi shu qatlam vazifasi.
import { createHash } from 'node:crypto';
export function shuffleOrder(length, seed) {
  const list = Array.from({ length }, (_, i) => i);
  let cursor = 0;
  for (let i = length - 1; i > 0; i--) {
    const bytes = createHash('sha256')
      .update(seed + ':' + cursor++)
      .digest();
    const j = bytes.readUInt32BE(0) % (i + 1);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}
export function presentation(questions, settings, seed) {
  const order = settings.shuffleQuestions ? shuffleOrder(questions.length, seed) : questions.map((_, i) => i);
  return order.map((index) => {
    const q = questions[index],
      options = settings.shuffleOptions
        ? shuffleOrder(q.options.length, seed + ':' + index)
        : q.options.map((_, i) => i);
    return {
      q: q.q,
      options: options.map((i) => q.options[i]),
      answer: options.indexOf(q.answer),
      sourceIndex: index,
      sourceOptions: options,
      ...(q.rich
        ? {
            rich: {
              ...structuredClone(q.rich),
              options: options.map((i) => structuredClone(q.rich.options[i])),
            },
          }
        : {}),
    };
  });
}
