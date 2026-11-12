// Lokal MathJax bilan xavfsiz chiqarilgan MathML formulalarni SVG ko'rinishiga o'tkazadi.
let ready;
let pending = Promise.resolve();
export function renderMath(root) {
  if (!root?.querySelector('math')) return;
  if (!ready) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = '/vendor/mathjax/svg.css';
    const stylesReady = new Promise((resolve, reject) => {
      stylesheet.onload = resolve;
      stylesheet.onerror = () => reject(new Error('Formula uslublari yuklanmadi.'));
      document.head.append(stylesheet);
    });
    window.MathJax = {
      loader: {
        paths: { fonts: '/vendor/mathjax/fonts' },
        load: ['input/mml', 'output/svg'],
      },
      startup: {
        typeset: false,
        ready() {
          window.MathJax.startup.defaultReady();
          window.MathJax.startup.output.styleSheet = () => stylesheet;
        },
      },
    };
    const scriptReady = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = '/vendor/mathjax/startup.js';
      script.onload = () => window.MathJax.startup.promise.then(resolve, reject);
      script.onerror = () => reject(new Error('Lokal MathJax yuklanmadi.'));
      document.head.append(script);
    });
    ready = Promise.all([scriptReady, stylesReady]);
  }
  pending = pending
    .then(() => ready)
    .then(() => {
      if (root.isConnected && root.querySelector('math')) {
        const detached = [...window.MathJax.startup.document.math]
          .map((item) => item.typesetRoot)
          .filter((node) => node && !node.isConnected);
        if (detached.length) window.MathJax.typesetClear(detached);
        return window.MathJax.typesetPromise([root]);
      }
    })
    .catch((error) => console.error(error));
  return pending;
}
