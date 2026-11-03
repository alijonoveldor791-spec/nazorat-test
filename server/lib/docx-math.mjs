// Word OMML formulalarini xavfsiz MathML Core elementlariga aylantiradi.
import { MATH, MATHML, child, elements, allText, attr, escapeXml } from './docx-xml.mjs';
import { fail } from './http.mjs';
const wrap = (tag, body, attrs = '') => `<${tag}${attrs}>${body}</${tag}>`;
export function ommlMath(node) {
  function convert(n) {
    if (!n) fail('Formulaning majburiy qismi yetishmaydi.');
    if (typeof n === 'string') return '';
    if (n.uri !== MATH) return '';
    const part = (name) => convert(child(n, name, MATH));
    const list = () =>
      elements(n)
        .filter((c) => !c.name.endsWith('Pr'))
        .map(convert)
        .join('');
    const prop = (group, name, fallback) =>
      attr(child(child(n, group, MATH), name, MATH), 'val', MATH) ?? fallback;
    if (n.name.endsWith('Pr') || ['ctrlPr', 'argPr'].includes(n.name)) return '';
    if (n.name === 't') return wrap('mtext', escapeXml(allText(n)));
    if (
      ['oMath', 'oMathPara', 'e', 'num', 'den', 'sup', 'sub', 'deg', 'lim', 'fName', 'r', 'box'].includes(
        n.name
      )
    )
      return wrap('mrow', list());
    if (n.name === 'f') return wrap('mfrac', part('num') + part('den'));
    if (n.name === 'sSup') return wrap('msup', part('e') + part('sup'));
    if (n.name === 'sSub') return wrap('msub', part('e') + part('sub'));
    if (n.name === 'sSubSup') return wrap('msubsup', part('e') + part('sub') + part('sup'));
    if (n.name === 'sPre')
      return wrap('mmultiscripts', part('e') + '<mprescripts/>' + part('sub') + part('sup'));
    if (n.name === 'rad')
      return prop('radPr', 'degHide', '0') === '1' || !allText(child(n, 'deg', MATH))
        ? wrap('msqrt', part('e'))
        : wrap('mroot', part('e') + part('deg'));
    if (n.name === 'nary') {
      let symbol = wrap('mo', escapeXml(prop('naryPr', 'chr', '∫')), ' largeop="true"');
      const sub = child(n, 'sub', MATH),
        sup = child(n, 'sup', MATH);
      if (sub && sup) symbol = wrap('munderover', symbol + convert(sub) + convert(sup));
      else if (sub) symbol = wrap('munder', symbol + convert(sub));
      else if (sup) symbol = wrap('mover', symbol + convert(sup));
      return wrap('mrow', symbol + part('e'));
    }
    if (n.name === 'limLow') return wrap('munder', part('e') + part('lim'));
    if (n.name === 'limUpp') return wrap('mover', part('e') + part('lim'));
    if (n.name === 'func') return wrap('mrow', part('fName') + part('e'));
    if (n.name === 'd')
      return wrap(
        'mrow',
        wrap('mo', escapeXml(prop('dPr', 'begChr', '('))) +
          elements(n)
            .filter((c) => c.name === 'e')
            .map(convert)
            .join(wrap('mo', escapeXml(prop('dPr', 'sepChr', '|')))) +
          wrap('mo', escapeXml(prop('dPr', 'endChr', ')')))
      );
    if (n.name === 'm')
      return wrap(
        'mtable',
        elements(n)
          .filter((c) => c.name === 'mr')
          .map(convert)
          .join('')
      );
    if (n.name === 'mr')
      return wrap(
        'mtr',
        elements(n)
          .filter((c) => c.name === 'e')
          .map((c) => wrap('mtd', convert(c)))
          .join('')
      );
    if (n.name === 'eqArr')
      return wrap(
        'mtable',
        elements(n)
          .filter((c) => c.name === 'e')
          .map((c) => wrap('mtr', wrap('mtd', convert(c))))
          .join('')
      );
    if (n.name === 'acc')
      return wrap('mover', part('e') + wrap('mo', escapeXml(prop('accPr', 'chr', '̂'))), ' accent="true"');
    if (n.name === 'bar')
      return wrap(prop('barPr', 'pos', 'top') === 'bot' ? 'munder' : 'mover', part('e') + wrap('mo', '‾'));
    if (n.name === 'groupChr')
      return wrap(
        prop('groupChrPr', 'pos', 'bot') === 'top' ? 'mover' : 'munder',
        part('e') + wrap('mo', escapeXml(prop('groupChrPr', 'chr', '⏟')))
      );
    if (n.name === 'borderBox') return wrap('menclose', part('e'), ' notation="box"');
    if (n.name === 'phant')
      fail("Yashirin formula (phantom) qo'llanmaydi. Uni oddiy Word Equationga aylantiring.");
    fail(`Word formulasi turi qollanmaydi: ${n.name}.`);
  }
  return {
    type: 'math',
    format: 'mathml',
    display: node.name === 'oMathPara',
    alt: allText(node).slice(0, 2000),
    source: `<math xmlns="${MATHML}">${convert(node)}</math>`,
  };
}
