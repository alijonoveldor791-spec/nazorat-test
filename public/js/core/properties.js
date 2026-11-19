// DOM atributlari, forma qiymatlari, havolalar va hodisalarni xavfsiz yangilaydi.
const listeners = new WeakMap();
const BOOLEAN_PROPERTIES = new Set([
  'checked',
  'disabled',
  'required',
  'multiple',
  'selected',
  'readOnly',
  'autoFocus',
  'hidden',
  'open',
  'controls',
  'inert',
]);

function eventName(name, element) {
  if (name === 'onDoubleClick') return 'dblclick';
  if (name === 'onChange') {
    return element.tagName === 'SELECT' || ['file', 'checkbox', 'radio'].includes(element.type)
      ? 'change'
      : 'input';
  }
  return name.slice(2).toLowerCase();
}

export function setProperties(element, previous, next) {
  for (const name of new Set([...Object.keys(previous), ...Object.keys(next)])) {
    if (['children', 'key', 'ref', 'dangerouslySetInnerHTML', 'value', 'defaultValue'].includes(name))
      continue;
    const value = next[name];
    if (name.startsWith('on')) {
      let map = listeners.get(element);
      if (!map) listeners.set(element, (map = new Map()));
      const old = map.get(name);
      const type = eventName(name, element);
      if (old) element.removeEventListener(old.type, old.fn);
      if (typeof value === 'function') {
        element.addEventListener(type, value);
        map.set(name, { type, fn: value });
      } else map.delete(name);
    } else if (name === 'style') {
      for (const property of new Set([...Object.keys(previous.style || {}), ...Object.keys(value || {})])) {
        const setting = value?.[property];
        const cssName = property.startsWith('--')
          ? property
          : property.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase());
        const units =
          typeof setting === 'number' &&
          setting !== 0 &&
          !/^(opacity|zIndex|flex|flexGrow|flexShrink|order|fontWeight|lineHeight)$/.test(property);
        element.style.setProperty(cssName, setting == null ? '' : String(setting) + (units ? 'px' : ''));
      }
    } else if (BOOLEAN_PROPERTIES.has(name)) {
      element[name] = Boolean(value);
      if (!value) element.removeAttribute(name.toLowerCase());
    } else {
      const attribute = name === 'className' ? 'class' : name === 'htmlFor' ? 'for' : name;
      if (value == null || value === false) element.removeAttribute(attribute);
      else if (previous[name] !== value) element.setAttribute(attribute, String(value));
    }
  }
  if (previous.ref !== next.ref && previous.ref) assignRef(previous.ref, null);
  if (next.ref) assignRef(next.ref, element);
}

export function setFormValue(element, props) {
  if (element.type === 'file') return;
  if (props.value !== undefined && element.value !== String(props.value ?? ''))
    element.value = props.value ?? '';
  else if (props.defaultValue !== undefined && !element.dataset.initialValue) {
    element.value = props.defaultValue;
    element.dataset.initialValue = '1';
  }
}

export function assignRef(reference, element) {
  if (typeof reference === 'function') reference(element);
  else reference.current = element;
}
