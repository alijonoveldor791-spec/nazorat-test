// Tanlangan rasm o'lchami tarixini va Enter/undo/redo tugmalarini boshqaradi.
import { reference } from '../../../core/state.js';

const dimensions = (img) => ({ width: img.getAttribute('width'), height: img.getAttribute('height') });
const displaySize = (img) => ({
  width: img.getAttribute('width') || String(img.naturalWidth || Math.round(img.width) || ''),
  height: img.getAttribute('height') || String(img.naturalHeight || Math.round(img.height) || ''),
});
export function imageControls(scope) {
  const live = reference(scope);
  live.current = scope;
  function selectedImage() {
    const selected = live.current.selectedImg;
    return selected?.img.isConnected && !selected.removed ? selected : null;
  }
  function save(selected, patch) {
    selected.commit();
    live.current.setSelectedImg((previous) =>
      previous?.img === selected.img ? { ...previous, ...displaySize(selected.img), ...patch } : previous
    );
  }
  scope.endImageResize = () =>
    scope.setSelectedImg((previous) =>
      previous ? { ...previous, ...displaySize(previous.img), resizeSession: null } : previous
    );
  scope.resizeImage = (attribute, value) => {
    const selected = selectedImage();
    if (!selected) return;
    if (!value || !Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 1600) {
      scope.setSelectedImg((previous) => (previous ? { ...previous, [attribute]: value } : previous));
      return;
    }
    if (selected.img.getAttribute(attribute) === String(Number(value))) return;
    const history =
      selected.resizeSession === attribute
        ? selected.history || []
        : [...(selected.history || []), dimensions(selected.img)].slice(-50);
    selected.img.setAttribute(attribute, String(Number(value)));
    save(selected, { history, future: [], resizeSession: attribute, status: "Rasm o'lchami yangilandi." });
  };
  scope.resetImageSize = () => {
    const selected = selectedImage();
    if (!selected || (!selected.img.hasAttribute('width') && !selected.img.hasAttribute('height'))) return;
    const history = [...(selected.history || []), dimensions(selected.img)].slice(-50);
    selected.img.removeAttribute('width');
    selected.img.removeAttribute('height');
    save(selected, { history, future: [], resizeSession: null, status: "Asl o'lcham tiklandi." });
  };
  scope.undoImageResize = (redo = false) => {
    const selected = selectedImage();
    if (!selected) return false;
    const source = redo ? selected.future || [] : selected.history || [];
    if (!source.length) return false;
    const previous = dimensions(selected.img),
      next = source.at(-1);
    for (const attribute of ['width', 'height']) {
      if (next[attribute] === null) selected.img.removeAttribute(attribute);
      else selected.img.setAttribute(attribute, next[attribute]);
    }
    save(selected, {
      history: redo ? [...(selected.history || []), previous] : source.slice(0, -1),
      future: redo ? source.slice(0, -1) : [...(selected.future || []), previous],
      resizeSession: null,
      status: redo ? "Rasm o'lchami qayta qo'llandi." : "Oldingi o'lcham qaytarildi.",
    });
    return true;
  };
  scope.handleImageKey = (event) => {
    const key = event.key.toLowerCase();
    if (key === 'enter') {
      event.preventDefault();
      event.stopPropagation();
      scope.endImageResize();
      selectedImage()?.img.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    } else if ((event.ctrlKey || event.metaKey) && ['z', 'y'].includes(key)) {
      if (selectedImage()) {
        event.preventDefault();
        event.stopPropagation();
        scope.undoImageResize(key === 'y' || event.shiftKey);
      }
    }
  };
}
