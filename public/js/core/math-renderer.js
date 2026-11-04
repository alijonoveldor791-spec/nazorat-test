// Lokal MathJax bilan xavfsiz chiqarilgan MathML formulalarni SVG ko'rinishiga o'tkazadi.
let ready;
export function renderMath(root) {
  if (!root?.querySelector('math')) return;
  if (!ready) {
    window.MathJax = {
      startup: { typeset: false },
      tex: { packages: ['base', 'ams', 'newcommand', 'noundefined'] },
    };
    ready = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/vendor/mathjax/tex-mml-svg-nofont.js';
      script.onload = resolve;
      script.onerror = () => reject(new Error('Lokal MathJax yuklanmadi.'));
      document.head.append(script);
    });
  }
  ready.then(() => window.MathJax.typesetPromise([root])).catch((error) => {
    console.error(error);
  });
}
