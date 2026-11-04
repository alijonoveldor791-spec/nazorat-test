// Savol ichidagi mahalliy rasmlarni dialogda kattalashtirib ko'rsatadi.
export function initImagePreview() {
  const dialog = document.getElementById('image-preview');
  const preview = dialog.querySelector('img');
  document.addEventListener('click', (event) => {
    if (event.target.closest('[data-image-close]')) dialog.close();
    const image = event.target.closest('#question-title img, #options img');
    if (!image) return;
    const source = image.currentSrc || image.src;
    const safeData = source.startsWith('data:image/');
    const safeLocal = new URL(source, location.href).origin === location.origin;
    if (!safeData && !safeLocal) return;
    preview.src = source;
    preview.alt = image.alt || 'Savoldagi rasm';
    dialog.showModal();
  });
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    preview.removeAttribute('src');
  });
}
