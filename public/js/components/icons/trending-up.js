// Mahalliy Lucide SVG belgisi; ISC litsenziyasi (assets/lucide-license.txt).
import { el } from '../../core/dom.js';
export function TrendingUp(props) {
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
      __html: '<path d="M16 7h6v6"></path><path d="m22 7-8.5 8.5-5-5L2 17"></path>',
    },
  });
}
