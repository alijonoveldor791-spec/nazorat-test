// Mahalliy Lucide SVG belgisi; ISC litsenziyasi (assets/lucide-license.txt).
import { el } from '../../core/dom.js';
export function Upload(props) {
  return el('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    'aria-hidden': 'true',
    ...props,
    dangerouslySetInnerHTML: {
      __html:
        '<path d="M12 3v12"></path><path d="m17 8-5-5-5 5"></path><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>',
    },
  });
}
