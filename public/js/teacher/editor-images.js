// Tahrirlagichda bitta tanlangan rasmni masshtablash, o'chirish va qaytarish.
export function bindEditorImages(host, syncField) {
  const tools = document.createElement('div');
  tools.className = 'editor-image-tools';
  tools.setAttribute('role', 'group');
  tools.setAttribute('aria-label', 'Tanlangan rasm');
  tools.innerHTML = `<label>Rasm kengligi (px)<input type="number" min="1" max="1600" step="1" aria-label="Rasm kengligi (px)"></label>
<label>Rasm balandligi (px)<input type="number" min="1" max="1600" step="1" aria-label="Rasm balandligi (px)"></label>
<button type="button" class="btn secondary small" data-image-reset>Asl o'lcham</button>
<button type="button" class="btn danger small" data-image-delete>Rasmni o'chirish</button>
<button type="button" class="btn secondary small" data-image-undo hidden>Rasmni qaytarish</button>
<span class="help" role="status"></span>`;
  const [width, height] = tools.querySelectorAll('input');
  const undo = tools.querySelector('[data-image-undo]');
  const status = tools.querySelector('[role="status"]');
  let image, field, removed;
  function select(next) {
    image?.removeAttribute('data-editor-selected');
    image = next;
    field = image.closest('.rich-editor');
    removed = null;
    image.setAttribute('data-editor-selected', '');
    width.disabled = height.disabled = false;
    width.value = image.getAttribute('width') || image.naturalWidth || Math.round(image.width);
    height.value = image.getAttribute('height') || Math.round(image.height) || image.naturalHeight;
    undo.hidden = true;
    tools.querySelectorAll('button:not([data-image-undo])').forEach((node) => (node.disabled = false));
    field.after(tools);
    status.textContent = 'Rasm tanlandi. Kenglik va balandlikni sozlang.';
  }
  host.addEventListener('click', (event) => {
    const next = event.target.closest('.rich-editor img');
    if (next) {
      event.preventDefault();
      select(next);
    }
  });
  width.addEventListener('change', () => {
    if (!image?.isConnected || !width.reportValidity() || !width.value) return;
    image.setAttribute('width', String(Number(width.value)));
    height.value = image.getAttribute('height') || Math.round(image.height);
    syncField(field);
    status.textContent = `Kenglik: ${width.value} px. Kichik ekranda rasm konteynerga moslashadi.`;
  });
  height.addEventListener('change', () => {
    if (!image?.isConnected || !height.reportValidity() || !height.value) return;
    if (!image.hasAttribute('width')) image.setAttribute('width', width.value);
    image.setAttribute('height', String(Number(height.value)));
    syncField(field);
    status.textContent = `Balandlik: ${height.value} px.`;
  });
  [width, height].forEach((input) =>
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        input.dispatchEvent(new Event('change'));
      }
    })
  );
  tools.querySelector('[data-image-reset]').onclick = () => {
    if (!image?.isConnected) return;
    image.removeAttribute('width');
    image.removeAttribute('height');
    width.value = image.naturalWidth || Math.round(image.width);
    height.value = image.naturalHeight || Math.round(image.height);
    syncField(field);
    status.textContent = "Asl o'lcham tiklandi.";
  };
  tools.querySelector('[data-image-delete]').onclick = () => {
    if (!image?.isConnected) return;
    removed = { parent: image.parentNode, next: image.nextSibling };
    image.removeAttribute('data-editor-selected');
    image.remove();
    syncField(field);
    undo.hidden = false;
    width.disabled = height.disabled = true;
    tools.querySelectorAll('button:not([data-image-undo])').forEach((node) => (node.disabled = true));
    status.textContent = "Rasm o'chirildi. Qaytarish mumkin.";
  };
  undo.onclick = () => {
    if (!removed?.parent.isConnected) return;
    removed.parent.insertBefore(image, removed.next?.parentNode === removed.parent ? removed.next : null);
    select(image);
    syncField(field);
    status.textContent = 'Rasm qaytarildi.';
  };
  return () => {
    image?.removeAttribute('data-editor-selected');
    image = field = removed = null;
    tools.remove();
  };
}
