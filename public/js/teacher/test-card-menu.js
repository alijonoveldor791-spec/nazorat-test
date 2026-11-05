// Karta menyusiga joy ajratadi; boshqa amallarni yopmaydi, Escape fokusni qaytaradi.
export function initTestCardMenus() {
  const openMenus = () => document.querySelectorAll('#test-list .test-card-menu[open]');
  document.addEventListener(
    'toggle',
    (event) => {
      const menu = event.target;
      if (!menu.matches('#test-list .test-card-menu[open]')) return;
      openMenus().forEach((other) => {
        if (other !== menu) other.open = false;
      });
      const heading = menu.closest('.test-card-top');
      const height = Number(heading.dataset.menuSize) * 52 + 8;
      menu.dataset.direction =
        menu.querySelector('summary').getBoundingClientRect().bottom + height > innerHeight ? 'up' : 'down';
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
    if (event.key !== 'Escape' || document.querySelector('dialog[open]')) return;
    const menu = openMenus()[0];
    if (!menu) return;
    event.preventDefault();
    menu.open = false;
    menu.querySelector('summary').focus();
  });
  window.addEventListener('resize', () =>
    openMenus().forEach((menu) => {
      menu.open = false;
    })
  );
}
