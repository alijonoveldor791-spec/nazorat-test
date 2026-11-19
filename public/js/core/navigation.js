// Oddiy HTML havolalari, manzil parametrlari va faol kabinet menyusini boshqaradi.
import { el } from './dom.js';
import { beginNavigation } from './lifecycle.js';
const params = new URLSearchParams(location.search);
export function navigate(target, options = {}) {
  beginNavigation();
  if (typeof target === 'number') return history.go(target);
  if (options.replace) location.replace(target);
  else location.assign(target);
}
export function useNavigate() {
  return navigate;
}
export function useSearchParams() {
  return [
    params,
    (next) => {
      beginNavigation();
      location.search = new URLSearchParams(next).toString();
    },
  ];
}
export function useLocation() {
  return location;
}
export function Link({ to, children, ...props }) {
  return el('a', { ...props, href: to }, children);
}
export function NavLink({ to, end, className, children, ...props }) {
  const current = location.pathname.replace(/\/index\.html$|\.html$|\/$/g, '') || '/';
  const isActive = current === to || (!end && current.startsWith(to + '/'));
  return el(
    'a',
    {
      ...props,
      href: to,
      'aria-current': isActive ? 'page' : undefined,
      className: typeof className === 'function' ? className({ isActive }) : className,
    },
    children
  );
}
