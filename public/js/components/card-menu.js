// Karta ustidagi amallar oynasi: fokus, kartadagi fon boshqaruvlari va yopilish.
export function initCardMenus() {
  const openMenus = () => document.querySelectorAll('.card-overlay-menu[open]');
  document.addEventListener(
    'toggle',
    (event) => {
      const menu = event.target;
      if (!menu.matches('.card-overlay-menu')) return;
      const card = menu.closest('.card-overlay-card');
      [...card.children].forEach((child) => {
        if (!child.classList.contains('card-overlay-top')) child.inert = menu.open;
      });
      if (!menu.open) return;
      openMenus().forEach((other) => {
        if (other !== menu) other.open = false;
      });
      const panel = menu.querySelector('.card-overlay-items');
      panel.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      panel.querySelector('button')?.focus({ preventScroll: true });
    },
    true
  );
  document.addEventListener('click', (event) => {
    openMenus().forEach((menu) => {
      if (!menu.contains(event.target)) menu.open = false;
      else if (event.target.closest('[data-action]') && !document.querySelector('dialog[open]')) {
        menu.open = false;
        menu.querySelector('summary').focus({ preventScroll: true });
      }
    });
  });
  document.addEventListener('keydown', (event) => {
    if (document.querySelector('dialog[open]')) return;
    const menu = openMenus()[0];
    if (!menu) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      menu.open = false;
      menu.querySelector('summary').focus();
    } else if (event.key === 'Tab') {
      const controls = [...menu.querySelectorAll('summary, button:not(:disabled)')];
      const index = controls.indexOf(document.activeElement);
      if ((!event.shiftKey && index === controls.length - 1) || (event.shiftKey && index <= 0)) {
        event.preventDefault();
        controls[event.shiftKey ? controls.length - 1 : 0].focus();
      }
    }
  });
  window.addEventListener('resize', () =>
    openMenus().forEach((menu) => {
      menu.open = false;
    })
  );
}
