export function parseAiken(input) {
  if (typeof input !== 'string' || input.length > 1_000_000) throw new Error('Test matni 1 MB dan oshmasin.');
  const lines = input.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = []; let block = [];
  lines.forEach((line, i) => { if (line.trim()) block.push({text:line.trim(), line:i+1}); else if (block.length) { blocks.push(block); block=[]; } });
  if (block.length) blocks.push(block);
  if (!blocks.length) throw new Error('Fayl bo’sh.');
  if (blocks.length > 200) throw new Error('Savollar soni 200 tadan oshmasin.');
  return blocks.map((rows, index) => {
    const question = [], options = []; let answer = null;
    const fail = (line, message) => { throw new Error(`${index+1}-savol, ${line}-qator: ${message}`); };
    for (const {text, line} of rows) {
      if (answer !== null) fail(line, 'ANSWER faqat bir marta, oxirgi qatorda bo’lsin.');
      const correct = /^(ANSWER|JAVOB)\s*[:：]\s*([A-F])\s*$/i.exec(text);
      if (correct) { if (options.length < 2) fail(line,'Avval kamida 2 ta variant kiriting.'); answer=correct[2].toUpperCase().charCodeAt(0)-65; continue; }
      if (/^(ANSWER|JAVOB)\s*[:：]/i.test(text)) fail(line,'Javob A–F harflaridan biri bo’lsin.');
      const option = /^([A-Z])[.)]\s*(.*)$/i.exec(text);
      if (option) {
        if (option[1].toUpperCase().charCodeAt(0)-65 !== options.length || options.length >= 6) fail(line,'Variantlar A dan boshlab ketma-ket, ko’pi bilan 6 ta bo’lsin.');
        if (!option[2].trim()) fail(line,'Variant matni bo’sh.');
        options.push(option[2].trim());
      } else if (!options.length) question.push(text);
      else fail(line,'Variant yoki ANSWER qatori kutilgan.');
    }
    const last=rows.at(-1).line;
    if (!question.length) fail(rows[0].line,'Savol matni yo’q.');
    if (options.length<2) fail(last,'Kamida 2 ta variant kerak.');
    if (answer===null) fail(last,'ANSWER: qatori yo’q.');
    if (answer>=options.length) fail(last,'Javob variantlar orasida yo’q.');
    if (question.join(' ').length>2000 || options.some(o=>o.length>1000)) fail(last,'Savol 2000, variant 1000 belgidan oshmasin.');
    return {q:question.join(' '), options, answer};
  });
}
export function toAiken(questions) { return questions.map(q=>q.q+'\n'+q.options.map((o,i)=>'ABCDEF'[i]+'. '+o).join('\n')+'\nANSWER: '+'ABCDEF'[q.answer]).join('\n\n'); }
