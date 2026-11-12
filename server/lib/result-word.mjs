// Saqlangan natija snapshotidan o'quvchining savol-javob varaqasini tayyorlaydi.
import { wordText, wordRun, wordParagraph, wordTable } from './word-xml.mjs';
import { wordContent } from './word-rich.mjs';
import { createWordMedia } from './word-media.mjs';
import { wordPackage } from './word-package.mjs';
const scoreText = (value) => (Number.isFinite(value) ? String(value).replace('.', ',') : '-');
const letter = (index) => String.fromCharCode(65 + index);
function questionSheet(q, selected, index, result, media) {
  const options = Array.isArray(q.options) ? q.options : [];
  const answered = Number.isInteger(selected) && selected >= 0 && selected < options.length;
  const hasKey = Number.isInteger(q.answer) && q.answer >= 0 && q.answer < options.length;
  const correct = hasKey && answered && selected === q.answer;
  const status = !answered
    ? 'Javobsiz'
    : !hasKey
      ? 'Javob kaliti saqlanmagan'
      : correct
        ? "To'g'ri"
        : "Noto'g'ri";
  let xml = wordText(index + 1 + '-savol', 'Heading2');
  if (q.section) xml += wordText(q.section.type + ' / ' + q.section.subject);
  xml += wordContent(q.q, q.contentFormat, media);
  options.forEach((option, i) => {
    const flags = [];
    if (answered && selected === i) flags.push("O'quvchi tanlagan");
    if (hasKey && q.answer === i) flags.push("To'g'ri javob");
    xml += wordParagraph(wordRun(letter(i) + ') ' + flags.join(' / '), flags.length ? '<w:b/>' : ''));
    xml += wordContent(option, q.contentFormat, media);
  });
  const units =
    result.dtmScore === undefined
      ? 10
      : result.scoringPolicy?.sections?.find((row) => row.id === q.section?.id)?.coefficientUnits;
  const awarded = !hasKey ? undefined : !correct ? 0 : Number.isInteger(units) ? units / 10 : undefined;
  xml += wordText(
    "O'quvchi javobi: " +
      (answered ? letter(selected) : 'Javobsiz') +
      "; To'g'ri javob: " +
      (hasKey ? letter(q.answer) : 'Saqlanmagan') +
      '; Holat: ' +
      status +
      '; Ball: ' +
      scoreText(awarded)
  );
  return xml;
}
export function buildResultWord(result) {
  const media = createWordMedia(),
    questions = Array.isArray(result.questions) ? result.questions : [],
    answers = result.answers || [];
  const dtm = result.dtmScore !== undefined,
    totalScore = dtm ? result.dtmScore : result.score,
    maximum = dtm ? (result.maxScore ?? 189) : result.total;
  let body = wordText("O'quvchining test varaqasi", 'Title');
  body += wordText('Ism familiyasi: ' + [result.surname, result.name].filter(Boolean).join(' '));
  body += wordText('Sinf/guruh: ' + (result.grade || '-'));
  body += wordText('Test: ' + (result.testTitle || 'Eski test'));
  if (result.time && Number.isFinite(Date.parse(result.time)))
    body += wordText(
      'Yakunlangan vaqt (Toshkent): ' +
        new Date(result.time).toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })
    );
  body += wordText('Baholash: ' + (dtm ? 'DTM uslubida' : 'Oddiy baholash'));
  body += wordText(
    "To'g'ri javoblar: " +
      (result.correctCount ?? result.score) +
      '/' +
      result.total +
      '; Jami ball: ' +
      scoreText(totalScore) +
      '/' +
      scoreText(maximum)
  );
  if (Number.isFinite(result.durationSec))
    body += wordText('Sarflangan vaqt: ' + result.durationSec + ' soniya');
  if (result.timedOut)
    body += wordText('Vaqt tugagan. Faqat serverga muddatida yetib kelgan javoblar baholangan.');
  if (result.sourceQuestionCount)
    body += wordText(
      'Bazada ' +
        result.sourceQuestionCount +
        ' savol; ushbu urinishda ' +
        questions.length +
        ' savol berilgan.'
    );
  if (result.sections?.length) {
    body += wordText("Fanlar bo'yicha natija", 'Heading1');
    const rows = [
      ["Bo'lim", 'Fan', "To'g'ri", 'Ball'].map((text) => ({ content: wordText(text), header: true })),
      ...result.sections.map((row) =>
        [
          row.type,
          row.subject,
          (row.correctCount ?? (!dtm ? row.score : '-')) + '/' + row.total,
          scoreText(row.score) + '/' + scoreText(row.maxScore ?? (!dtm ? row.total : undefined)),
        ].map((text) => ({ content: wordText(text) }))
      ),
    ];
    body += wordTable(rows);
  }
  body += wordText('Savollar va javoblar', 'Heading1');
  body += questions.length
    ? questions.map((q, index) => questionSheet(q, answers[index], index, result, media)).join('')
    : wordText(
        'Bu eski natijada savol va batafsil javoblar saqlanmagan. Faqat saqlangan umumiy natija keltirildi.'
      );
  return wordPackage(body, media);
}
export function resultWordFilename(result) {
  let name =
    [result.grade, result.surname, result.name]
      .filter(Boolean)
      .join(' - ')
      .replace(/[<>:"/\\|?*\x00-\x1f]/g, '-')
      .replace(/[. ]+$/g, '')
      .trim() || 'test-varaqasi';
  name = Array.from(Buffer.from(name, 'utf8').toString('utf8')).slice(0, 120).join('');
  if (/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(name)) name += '-natija';
  return name + '.docx';
}
