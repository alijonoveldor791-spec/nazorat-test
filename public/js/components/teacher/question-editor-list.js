// Sahifaning holati va ko'rinish qismlarini birlashtiradi.
import { part0 } from './question-editor-list/part-0.js';
export function QuestionEditorList({ questions, onChange, allowAdd = true, selectionSet, onToggleSelect }) {
  const scope = {};
  let result;
  scope.questions = questions;
  scope.onChange = onChange;
  scope.allowAdd = allowAdd;
  scope.selectionSet = selectionSet;
  scope.onToggleSelect = onToggleSelect;
  result = part0(scope);
  if (result?.done) return result.value;
}
