import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckSquare,
  Edit3,
  KeyRound,
  LayoutGrid,
  List,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { ConfirmDialog, Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAdminSession } from '../../hooks/useAdminSession';
import { useToast } from '../../context/ToastContext';
import { ApiError, adminApi, adminPost } from '../../lib/api';
import { copyToClipboard } from '../../lib/format';
import type { ResultRow, SchoolClass, TestItem } from '../../types/api';

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/['‘ʼ]/g, "'").replace(/\s+/g, ' ');
}

export function TeacherClassesPage() {
  const { session, loading: sessionLoading } = useAdminSession('teacher');
  const { toast } = useToast();

  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [results, setResults] = useState<ResultRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [kindFilter, setKindFilter] = useState<'' | 'class' | 'group'>('');
  const [directionFilter, setDirectionFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [editorOpen, setEditorOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<SchoolClass | null>(null);
  const [formKind, setFormKind] = useState<'class' | 'group'>('class');
  const [formDirection, setFormDirection] = useState('');
  const [formName, setFormName] = useState('');
  const [formRoster, setFormRoster] = useState('');
  const [saving, setSaving] = useState(false);

  const [codesModalClass, setCodesModalClass] = useState<SchoolClass | null>(null);
  const [progressModalClass, setProgressModalClass] = useState<SchoolClass | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SchoolClass | null>(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cls, tst, res] = await Promise.all([
        adminApi<SchoolClass[]>('classes'),
        adminApi<TestItem[]>('tests'),
        adminApi<ResultRow[]>('results'),
      ]);
      setClasses(cls);
      setTests(tst);
      setResults(res);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Sinflarni yuklab bo'lmadi.", true);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!sessionLoading && session) {
      loadData();
    }
  }, [sessionLoading, session, loadData]);

  const directions = useMemo(() => {
    const set = new Set<string>();
    for (const c of classes) {
      if (c.kind === 'group' && c.direction) set.add(c.direction);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'uz'));
  }, [classes]);

  const visibleClasses = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('uz');
    return classes.filter(
      (c) =>
        (!kindFilter || (c.kind || 'class') === kindFilter) &&
        (!directionFilter || (c.kind === 'group' && c.direction === directionFilter)) &&
        c.name.toLocaleLowerCase('uz').includes(q)
    );
  }, [classes, query, kindFilter, directionFilter]);

  const openEditor = (cls?: SchoolClass) => {
    setEditingClass(cls || null);
    setFormKind(cls?.kind === 'group' ? 'group' : 'class');
    setFormDirection(cls?.direction || '');
    setFormName(cls?.name || '');
    setFormRoster((cls?.students || []).map((s) => `${s.surname} ${s.name}`).join('\n'));
    setEditorOpen(true);
  };

  const handleSaveClass = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const path = editingClass ? `classes/${editingClass.id}` : 'classes';
      await adminPost(
        path,
        {
          name: formName.trim(),
          kind: formKind,
          direction: formKind === 'group' ? formDirection.trim() : '',
          roster: formRoster,
        },
        editingClass ? 'PUT' : 'POST'
      );
      toast('Sinf saqlandi.');
      setEditorOpen(false);
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Saqlashda xato yuz berdi.", true);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteOne = async () => {
    if (!deleteTarget) return;
    try {
      await adminApi(`classes/${deleteTarget.id}`, { method: 'DELETE' });
      setDeleteTarget(null);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(deleteTarget.id);
        return next;
      });
      toast("Sinf o'chirildi.");
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Sinfni o'chirib bo'lmadi.", true);
    }
  };

  const handleBulkDelete = async () => {
    const ids = visibleClasses.filter((c) => selectedIds.has(c.id)).map((c) => c.id);
    if (!ids.length) return;
    try {
      for (const id of ids) {
        await adminApi(`classes/${id}`, { method: 'DELETE' });
      }
      setBulkDeleteOpen(false);
      setSelectedIds(new Set());
      toast(`${ids.length} ta sinf o'chirildi.`);
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "O'chirishda xato yuz berdi.", true);
    }
  };

  const toggleSelectAll = () => {
    if (visibleClasses.length > 0 && visibleClasses.every((c) => selectedIds.has(c.id))) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(visibleClasses.map((c) => c.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const progressStats = useMemo(() => {
    if (!progressModalClass) return [];
    const students = progressModalClass.students || [];
    const classTests = tests.filter((t) => t.classIds.includes(progressModalClass.id));
    return classTests.map((test) => {
      const rows = results.filter(
        (row) =>
          row.testId === test.id &&
          (row.classId === progressModalClass.id || normalizeName(row.grade) === normalizeName(progressModalClass.name))
      );
      const missing = students.filter(
        (student) =>
          !rows.some((row) =>
            row.studentId
              ? row.studentId === student.id
              : normalizeName(`${row.surname} ${row.name}`) === normalizeName(`${student.surname} ${student.name}`)
          )
      );
      return { test, submitted: students.length - missing.length, total: students.length, missing };
    });
  }, [progressModalClass, tests, results]);

  const allVisibleSelected = visibleClasses.length > 0 && visibleClasses.every((c) => selectedIds.has(c.id));

  return (
    <AdminShell
      session={session}
      title="Sinflar va guruhlar"
      subtitle="Sinf ro'yxatlari, shaxsiy kodlar va topshirish holatini boshqaring."
      actions={
        <button
          type="button"
          onClick={() => openEditor()}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700 whitespace-nowrap shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Sinf yoki guruh qo'shish</span>
        </button>
      }
    >
      <div className="space-y-5">
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIds(new Set());
              }}
              placeholder="Nom bo'yicha qidirish..."
              aria-label="Sinf yoki guruh qidirish"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </div>

          <select
            value={kindFilter}
            onChange={(e) => {
              const next = e.target.value as '' | 'class' | 'group';
              setKindFilter(next);
              if (next === 'class') setDirectionFilter('');
              setSelectedIds(new Set());
            }}
            aria-label="Sinf yoki guruh turi"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">Sinflar va guruhlar</option>
            <option value="class">Faqat sinflar</option>
            <option value="group">Faqat guruhlar</option>
          </select>

          <select
            value={directionFilter}
            disabled={kindFilter === 'class'}
            onChange={(e) => {
              setDirectionFilter(e.target.value);
              setSelectedIds(new Set());
            }}
            aria-label="Yo'nalish filtri"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
          >
            <option value="">Barcha yo'nalishlar</option>
            {directions.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {(query || kindFilter || directionFilter) && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setKindFilter('');
                setDirectionFilter('');
                setSelectedIds(new Set());
              }}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Filtrlarni tozalash
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <label className="inline-flex cursor-pointer items-center gap-2 font-medium text-slate-700 dark:text-slate-200">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                disabled={visibleClasses.length === 0}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Hammasini tanlash</span>
            </label>
            <span className="tabular-nums text-xs">
              {visibleClasses.length} / {classes.length} ta
            </span>
            {selectedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setBulkDeleteOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700 whitespace-nowrap"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Tanlanganlarni o'chirish ({selectedIds.size})</span>
              </button>
            )}
          </div>

          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'cards'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Kartalar</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>Ro'yxat</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
            ))}
          </div>
        ) : visibleClasses.length === 0 ? (
          <EmptyState
            title="Sinf yoki guruh topilmadi"
            description={
              classes.length === 0
                ? "Birinchi sinf yoki guruhingizni qo'shing."
                : "Qidiruvni yoki filtrlarni o'zgartiring."
            }
          />
        ) : (
          <div className={viewMode === 'cards' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
            {visibleClasses.map((cls) => {
              const studentCount = cls.students?.length ?? cls.studentCount ?? 0;
              const assignedTests = tests.filter((t) => t.classIds.includes(cls.id)).length;
              const isGroup = cls.kind === 'group';
              return (
                <article
                  key={cls.id}
                  className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
                >
                  <div className="flex items-start justify-between gap-3">
                    <label className="flex items-start gap-2.5 cursor-pointer min-w-0">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(cls.id)}
                        onChange={() => toggleSelectOne(cls.id)}
                        className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                          {isGroup ? `Guruh · ${cls.direction || "Yo'nalishsiz"}` : 'Sinf'}
                        </p>
                        <h2 className="mt-0.5 font-display text-lg font-bold text-slate-900 truncate dark:text-white">
                          {cls.name}
                        </h2>
                      </div>
                    </label>
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 tabular-nums shrink-0 dark:text-slate-400">
                      <Users className="h-3.5 w-3.5" />
                      {studentCount} o'quvchi
                    </span>
                  </div>

                  <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                    Biriktirilgan testlar: <strong className="text-slate-800 dark:text-slate-200">{assignedTests} ta</strong>
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3.5 dark:border-slate-800">
                    <button
                      type="button"
                      onClick={() => openEditor(cls)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Tahrirlash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCodesModalClass(cls)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      <span>Kodlar</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgressModalClass(cls)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 whitespace-nowrap dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      <CheckSquare className="h-3.5 w-3.5" />
                      <span>Holat</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(cls)}
                      aria-label={`${cls.name} o'chirish`}
                      className="ml-auto inline-flex items-center rounded-lg border border-transparent p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/40 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={editorOpen}
        onClose={() => setEditorOpen(false)}
        title={editingClass ? 'Sinfni tahrirlash' : "Sinf yoki guruh qo'shish"}
        footer={
          <>
            <button
              type="button"
              onClick={() => setEditorOpen(false)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              form="class-editor-form"
              disabled={saving}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {saving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </>
        }
      >
        <form id="class-editor-form" onSubmit={handleSaveClass} className="space-y-4">
          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Tur</span>
            <select
              value={formKind}
              onChange={(e) => setFormKind(e.target.value as 'class' | 'group')}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            >
              <option value="class">Sinf</option>
              <option value="group">Guruh</option>
            </select>
          </label>

          {formKind === 'group' && (
            <label className="block space-y-1.5">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Yo'nalish nomi</span>
              <input
                type="text"
                required
                maxLength={100}
                value={formDirection}
                onChange={(e) => setFormDirection(e.target.value)}
                placeholder="Masalan: Matematika - Fizika"
                className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              />
            </label>
          )}

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Nom</span>
            <input
              type="text"
              required
              maxLength={60}
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={formKind === 'group' ? '1-guruh' : '7-A'}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              O'quvchilar ro'yxati (ixtiyoriy)
            </span>
            <textarea
              rows={6}
              value={formRoster}
              onChange={(e) => setFormRoster(e.target.value)}
              placeholder={'Aliyev Ali\nValiyeva Malika'}
              className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
            />
            <span className="block text-xs text-slate-500 dark:text-slate-400">
              Har qatorda bitta Familiya Ism. Ro'yxatdan qatorni olib tashlash o'quvchini o'chiradi.
            </span>
          </label>
        </form>
      </Modal>

      <Modal
        open={Boolean(codesModalClass)}
        onClose={() => setCodesModalClass(null)}
        title={codesModalClass ? `${codesModalClass.name} — shaxsiy kirish kodlari` : ''}
      >
        {codesModalClass && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Har bir kodni faqat tegishli o'quvchiga bering. Umumiy guruhga yubormang.
            </p>
            {(codesModalClass.students || []).length === 0 ? (
              <EmptyState title="O'quvchilar yo'q" description="Avval sinf ro'yxatini kiriting." />
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-950 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-2.5">O'quvchi</th>
                      <th className="px-4 py-2.5">Shaxsiy kod</th>
                      <th className="px-4 py-2.5 text-right">Nusxa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(codesModalClass.students || []).map((s) => (
                      <tr key={s.id}>
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">
                          {s.surname} {s.name}
                        </td>
                        <td className="px-4 py-2.5 font-mono text-xs text-slate-700 dark:text-slate-200">
                          {s.accessCode || '—'}
                        </td>
                        <td className="px-4 py-2.5 text-right">
                          {s.accessCode && (
                            <button
                              type="button"
                              onClick={async () => {
                                const ok = await copyToClipboard(s.accessCode!);
                                toast(ok ? 'Kod nusxalandi.' : 'Nusxalanmadi.', !ok);
                              }}
                              className="text-xs font-medium text-blue-600 hover:underline dark:text-blue-400"
                            >
                              Nusxalash
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>

      <Modal
        open={Boolean(progressModalClass)}
        onClose={() => setProgressModalClass(null)}
        title={progressModalClass ? `${progressModalClass.name} — topshirish holati` : ''}
        size="lg"
      >
        {progressModalClass && (
          <div className="space-y-4">
            {progressStats.length === 0 ? (
              <EmptyState
                title="Biriktirilgan test yo'q"
                description="Bu sinfga hali hech qanday test biriktirilmagan."
              />
            ) : (
              progressStats.map((row) => (
                <div
                  key={row.test.id}
                  className="rounded-xl border border-slate-200 p-4 dark:border-slate-800"
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-slate-900 dark:text-white">{row.test.title}</h3>
                    <span className="text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                      {row.submitted} / {row.total} topshirdi
                    </span>
                  </div>
                  {row.missing.length > 0 ? (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      Topshirmaganlar:{' '}
                      <span className="text-slate-700 dark:text-slate-200">
                        {row.missing.map((m) => `${m.surname} ${m.name}`).join(', ')}
                      </span>
                    </p>
                  ) : (
                    <p className="mt-2 text-xs text-emerald-600 dark:text-emerald-400">
                      Barcha o'quvchilar topshirgan.
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteOne}
        title="Sinf o'chirilsinmi?"
        message={
          deleteTarget
            ? `${tests.filter((t) => t.classIds.includes(deleteTarget.id)).length} ta test shu sinfga biriktirilgan. Sinf testlardan olinadi, eski natijalar saqlanadi.`
            : ''
        }
        confirmLabel="O'chirish"
        danger
      />

      <ConfirmDialog
        open={bulkDeleteOpen}
        onClose={() => setBulkDeleteOpen(false)}
        onConfirm={handleBulkDelete}
        title="Tanlangan sinflar o'chirilsinmi?"
        message={`${selectedIds.size} ta sinf yoki guruh o'chiriladi. Eski natijalar saqlanadi.`}
        confirmLabel="O'chirish"
        danger
      />
    </AdminShell>
  );
}
