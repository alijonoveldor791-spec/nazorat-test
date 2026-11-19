// Sahifaning holati va ko'rinish qismlarini birlashtiradi.
import { part0 } from './admin-shell/part-0.js';
export function AdminShell({ session, title, subtitle, actions, children }) {
  const scope = {};
  let result;
  scope.session = session;
  scope.title = title;
  scope.subtitle = subtitle;
  scope.actions = actions;
  scope.children = children;
  result = part0(scope);
  if (result?.done) return result.value;
}
