// Natijalarni serverdan qayta o'qib, har sessiyaga bitta yozuv va aynan javob/ballni tekshiradi.
import assert from 'node:assert/strict';
import { createReadStream } from 'node:fs';
import { createInterface } from 'node:readline';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { loadTarget, client } from './target.mjs';
const fixture = JSON.parse(await readFile(process.env.LOAD_FIXTURE || '.local/load/fixture.json', 'utf8'));
loadTarget(fixture.baseUrl);
const run = process.env.RUN_ID,
  expected = Number(process.env.STUDENTS || 500),
  kind = process.env.TEST_KIND || 'ordinary';
if (!run) throw Error('RUN_ID kerak.');
const expectations = new Map();
const eventsPath = (process.env.LOAD_OUTPUT_PREFIX || '.local/load/' + run) + '.events.json';
for await (const line of createInterface({ input: createReadStream(eventsPath), crlfDelay: Infinity })) {
  const event = JSON.parse(line);
  if (event.type === 'Point' && event.metric === 'session_expectation')
    expectations.set(event.data.tags.session, event.data.tags);
}
const identities = new Set(),
  details = [];
for (const school of fixture.schools) {
  const api = client(fixture.baseUrl, school.token),
    all = await api('admin/results');
  assert(
    all.every((r) => Object.values(school.tests).some((t) => t.id === r.testId)),
    'Maktablar orasida natija aralashdi'
  );
  const rows = all.filter((r) => r.surname === 'Load-' + run);
  for (let index = 0; index < rows.length; index += 8)
    await Promise.all(
      rows.slice(index, index + 8).map(async (row) => {
        assert.equal(row.testId, school.tests[kind].id);
        assert(!identities.has(row.name), 'Takroriy natija');
        identities.add(row.name);
        const result = await api('admin/results/' + row.id),
          id = Number(row.name.split(' ').at(-1));
        const answers = Array.from(
          { length: result.total },
          (_, i) => (i + (id % 5 === 0 && i % 7 === 0 ? 1 : 0)) % 4
        );
        const expectation = expectations.get(String(id));
        if (expectation)
          assert.equal(
            createHash('sha256').update(JSON.stringify(result.answers)).digest('hex'),
            expectation.digest,
            'Qabul qilingan javob hashiga mos emas'
          );
        else assert.deepEqual(result.answers, answers, 'Javob yoqoldi yoki eski draft ustidan yozdi');
        assert.equal(
          result.score,
          expectation ? Number(expectation.score) : answers.filter((a, i) => a === i % 4).length,
          'Ball mos emas'
        );
        assert.equal(result.questions.filter((q, i) => q.answer === result.answers[i]).length, result.score);
        if (kind === 'block')
          assert.deepEqual(
            result.sections.map((s) => s.total),
            [30, 30, 10, 10, 10]
          );
        details.push({ id: row.id, school: school.id, name: row.name, score: row.score, total: row.total });
      })
    );
}
assert.equal(identities.size, expected, 'Sessiyalar soni natijalarga mos emas');
if (fixture.schools.length > 1) {
  const one = fixture.schools[0],
    two = fixture.schools[1];
  const r = await fetch(fixture.baseUrl + '/api/admin/tests/' + one.tests[kind].id, {
    headers: { Authorization: 'Bearer ' + two.token },
  });
  assert.equal(r.status, 404, 'Begona test ochildi');
}
const report = {
  run,
  kind,
  expected,
  stored: details.length,
  unique: identities.size,
  correct: true,
  details,
};
await writeFile('.local/load/' + run + '.verified.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify({ run, kind, stored: details.length, unique: identities.size, correct: true }));
