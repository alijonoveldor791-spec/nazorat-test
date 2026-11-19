// Sahifaning holati, hodisalari yoki natijaviy ko'rinishini tayyorlaydi.
import {
  callback as useCallback,
  effect as useEffect,
  memo as useMemo,
  state as useState,
} from '../../core/state.js';
import { useAdminSession } from '../../core/use-admin-session.js';
import { useToast } from '../../components/toast-context.js';
import { ApiError, adminApi, adminPost } from '../../core/api.js';
export function part0(scope) {
  ({ session: scope.session, loading: scope.sessionLoading } = useAdminSession('teacher'));
  ({ toast: scope.toast } = useToast());
  [scope.classes, scope.setClasses] = useState([]);
  [scope.tests, scope.setTests] = useState([]);
  [scope.results, scope.setResults] = useState([]);
  [scope.loading, scope.setLoading] = useState(true);
  [scope.query, scope.setQuery] = useState('');
  [scope.kindFilter, scope.setKindFilter] = useState('');
  [scope.directionFilter, scope.setDirectionFilter] = useState('');
  [scope.viewMode, scope.setViewMode] = useState('cards');
  [scope.selectedIds, scope.setSelectedIds] = useState(new Set());
  [scope.editorOpen, scope.setEditorOpen] = useState(false);
  [scope.editingClass, scope.setEditingClass] = useState(null);
  [scope.formKind, scope.setFormKind] = useState('class');
  [scope.formDirection, scope.setFormDirection] = useState('');
  [scope.formName, scope.setFormName] = useState('');
  [scope.formRoster, scope.setFormRoster] = useState('');
  [scope.saving, scope.setSaving] = useState(false);
  [scope.codesModalClass, scope.setCodesModalClass] = useState(null);
  [scope.progressModalClass, scope.setProgressModalClass] = useState(null);
  [scope.deleteTarget, scope.setDeleteTarget] = useState(null);
  [scope.bulkDeleteOpen, scope.setBulkDeleteOpen] = useState(false);
  scope.loadData = useCallback(async () => {
    scope.setLoading(true);
    try {
      const [cls, tst, res] = await Promise.all([
        adminApi('classes'),
        adminApi('tests'),
        adminApi('results'),
      ]);
      scope.setClasses(cls);
      scope.setTests(tst);
      scope.setResults(res);
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : "Sinflarni yuklab bo'lmadi.", true);
    } finally {
      scope.setLoading(false);
    }
  }, [scope.toast]);
  useEffect(() => {
    if (!scope.sessionLoading && scope.session) {
      scope.loadData();
    }
  }, [scope.sessionLoading, scope.session, scope.loadData]);
  scope.directions = useMemo(() => {
    const set = new Set();
    for (const c of scope.classes) {
      if (c.kind === 'group' && c.direction) set.add(c.direction);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'uz'));
  }, [scope.classes]);
  scope.visibleClasses = useMemo(() => {
    const q = scope.query.trim().toLocaleLowerCase('uz');
    return scope.classes.filter(
      (c) =>
        (!scope.kindFilter || (c.kind || 'class') === scope.kindFilter) &&
        (!scope.directionFilter || (c.kind === 'group' && c.direction === scope.directionFilter)) &&
        c.name.toLocaleLowerCase('uz').includes(q)
    );
  }, [scope.classes, scope.query, scope.kindFilter, scope.directionFilter]);
  scope.openEditor = (cls) => {
    scope.setEditingClass(cls || null);
    scope.setFormKind(cls?.kind === 'group' ? 'group' : 'class');
    scope.setFormDirection(cls?.direction || '');
    scope.setFormName(cls?.name || '');
    scope.setFormRoster((cls?.students || []).map((s) => `${s.surname} ${s.name}`).join('\n'));
    scope.setEditorOpen(true);
  };
  scope.handleSaveClass = async (e) => {
    e.preventDefault();
    scope.setSaving(true);
    try {
      const path = scope.editingClass ? `classes/${scope.editingClass.id}` : 'classes';
      await adminPost(
        path,
        {
          name: scope.formName.trim(),
          kind: scope.formKind,
          direction: scope.formKind === 'group' ? scope.formDirection.trim() : '',
          roster: scope.formRoster,
        },
        scope.editingClass ? 'PUT' : 'POST'
      );
      scope.toast('Sinf saqlandi.');
      scope.setEditorOpen(false);
      await scope.loadData();
    } catch (err) {
      scope.toast(err instanceof ApiError ? err.message : 'Saqlashda xato yuz berdi.', true);
    } finally {
      scope.setSaving(false);
    }
  };
}
