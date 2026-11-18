import React, { useCallback, useEffect, useState } from 'react';
import { RefreshCw, ShieldCheck } from 'lucide-react';
import { AdminShell } from '../../components/layout/AdminShell';
import { Modal } from '../../components/ui/Modal';
import { EmptyState } from '../../components/ui/EmptyState';
import { SafeContent } from '../../components/ui/SafeContent';
import { useAdminSession } from '../../hooks/useAdminSession';
import { useToast } from '../../context/ToastContext';
import { ApiError, superApi } from '../../lib/api';
import type { BankPolicy, SharedTest } from '../../types/api';

const ACTIONS: Record<string, string> = {
  view: "Umumiy bankni ko'rish",
  take: 'Testni olib onlayn ishlatish',
  docx: 'DOCX yuklab olish',
  pdf: 'PDF yuklab olish',
  key: 'Javoblar kaliti',
  rerunExpired: "Tarif tugagach qayta o'tkazish",
};

const LETTERS = 'ABCDEF';

export function SuperAdminBankPage() {
  const { session, loading: sessionLoading } = useAdminSession('super_admin');
  const { toast } = useToast();

  const [queue, setQueue] = useState<SharedTest[]>([]);
  const [policies, setPolicies] = useState<BankPolicy[]>([]);
  const [loading, setLoading] = useState(true);

  // Policy form
  const [policyType, setPolicyType] = useState<'school' | 'tariff'>('tariff');
  const [policyTarget, setPolicyTarget] = useState('');
  const [policyTariff, setPolicyTariff] = useState('');
  const [policyRules, setPolicyRules] = useState<Record<string, '' | 'true' | 'false'>>({});
  const [policyBusy, setPolicyBusy] = useState(false);

  // Review modal
  const [reviewItem, setReviewItem] = useState<SharedTest | null>(null);
  const [reviewStatus, setReviewStatus] = useState<'approved' | 'rejected'>('approved');
  const [reviewTariffs, setReviewTariffs] = useState('');
  const [reviewSchools, setReviewSchools] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [q, p] = await Promise.all([
        superApi<SharedTest[]>('shared-tests'),
        superApi<BankPolicy[]>('bank-policies'),
      ]);
      setQueue(q);
      setPolicies(p);
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Ma'lumotlarni yuklab bo'lmadi.", true);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!sessionLoading && session) {
      loadData();
    }
  }, [sessionLoading, session, loadData]);

  const handleSavePolicy = async (e: React.FormEvent) => {
    e.preventDefault();
    setPolicyBusy(true);
    try {
      const rules: Record<string, boolean> = {};
      for (const [k, v] of Object.entries(policyRules)) {
        if (v === 'true') rules[k] = true;
        else if (v === 'false') rules[k] = false;
      }
      await superApi('bank-policies', {
        method: 'PUT',
        body: JSON.stringify({
          type: policyType,
          target: policyTarget.trim(),
          tariffId: policyTariff.trim(),
          rules,
        }),
      });
      toast('Tarif / maktab istisnosi saqlandi.');
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      setPolicyBusy(false);
    }
  };

  const loadPolicyIntoForm = (p: BankPolicy) => {
    setPolicyType(p.type);
    setPolicyTarget(p.target);
    setPolicyTariff(p.tariffId);
    const nextRules: Record<string, '' | 'true' | 'false'> = {};
    for (const key of Object.keys(ACTIONS)) {
      nextRules[key] = p.rules[key] === undefined ? '' : p.rules[key] ? 'true' : 'false';
    }
    setPolicyRules(nextRules);
  };

  const openReview = (item: SharedTest) => {
    setReviewItem(item);
    setReviewStatus(item.status === 'rejected' ? 'rejected' : 'approved');
    setReviewTariffs((item.tariffIds || []).join(', '));
    setReviewSchools((item.schoolIds || []).join(', '));
  };

  const handleSaveReview = async () => {
    if (!reviewItem) return;
    setReviewBusy(true);
    const splitIds = (raw: string) =>
      raw
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
    try {
      await superApi(`shared-tests/${encodeURIComponent(reviewItem.id)}`, {
        method: 'PUT',
        body: JSON.stringify({
          status: reviewStatus,
          tariffIds: splitIds(reviewTariffs),
          schoolIds: splitIds(reviewSchools),
        }),
      });
      setReviewItem(null);
      toast('Moderatsiya saqlandi.');
      await loadData();
    } catch (err) {
      toast(err instanceof ApiError ? err.message : "Saqlab bo'lmadi.", true);
    } finally {
      setReviewBusy(false);
    }
  };

  return (
    <AdminShell
      session={session}
      title="Umumiy test banki"
      subtitle="Tarif va maktab istisnolarini hamda tayyor testlar moderatsiyasini boshqaring."
      actions={
        <button
          type="button"
          onClick={loadData}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Yangilash</span>
        </button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-12">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 lg:col-span-5 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h2 className="font-display text-lg font-bold">Tarif va maktab istisnolari</h2>
          </div>

          <form onSubmit={handleSavePolicy} className="space-y-4">
            <label className="block space-y-1">
              <span className="text-xs font-medium">Tur</span>
              <select
                value={policyType}
                onChange={(e) => setPolicyType(e.target.value as 'school' | 'tariff')}
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="tariff">Tarif</option>
                <option value="school">Maktab</option>
              </select>
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">Target ID</span>
              <input
                type="text"
                required
                value={policyTarget}
                onChange={(e) => setPolicyTarget(e.target.value)}
                placeholder="Tarif yoki maktab ichki IDsi"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </label>
            <label className="block space-y-1">
              <span className="text-xs font-medium">Tarif ID</span>
              <input
                type="text"
                value={policyTariff}
                onChange={(e) => setPolicyTariff(e.target.value)}
                placeholder="Masalan: pro"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <div className="space-y-2.5 border-t border-slate-100 pt-3 dark:border-slate-800">
              {Object.entries(ACTIONS).map(([key, label]) => (
                <label key={key} className="flex items-center justify-between gap-2 text-xs">
                  <span className="text-slate-700 dark:text-slate-300">{label}</span>
                  <select
                    value={policyRules[key] || ''}
                    onChange={(e) =>
                      setPolicyRules((prev) => ({
                        ...prev,
                        [key]: e.target.value as '' | 'true' | 'false',
                      }))
                    }
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-950"
                  >
                    <option value="">Tarifdan</option>
                    <option value="true">Ruxsat</option>
                    <option value="false">Yopiq</option>
                  </select>
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={policyBusy}
              className="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {policyBusy ? 'Saqlanmoqda...' : 'Qoidani saqlash'}
            </button>
          </form>

          {policies.length > 0 && (
            <div className="space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Saqlangan qoidalar
              </p>
              <div className="flex flex-wrap gap-2">
                {policies.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => loadPolicyIntoForm(p)}
                    className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                  >
                    {p.id}
                  </button>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="space-y-4 lg:col-span-7">
          <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">
            Moderatsiya navbati ({queue.length})
          </h2>

          {loading ? (
            <div className="space-y-3">
              {[0, 1].map((i) => (
                <div key={i} className="h-28 animate-pulse rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900" />
              ))}
            </div>
          ) : queue.length === 0 ? (
            <EmptyState
              title="Yuborilgan test yo'q"
              description="O'qituvchilar tomonidan umumiy bankka ulashilgan testlar shu yerda ko'rinadi."
            />
          ) : (
            <div className="space-y-3">
              {queue.map((t) => (
                <article
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                >
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                      {t.title}
                    </h3>
                    <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {t.subject} · {t.questions.length} savol · Holat: {t.status}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => openReview(t)}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                  >
                    Ko'rib chiqish
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <Modal
        open={Boolean(reviewItem)}
        onClose={() => setReviewItem(null)}
        title="Tayyor testni ko'rib chiqish"
        size="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setReviewItem(null)}
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium dark:border-slate-700"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              disabled={reviewBusy}
              onClick={handleSaveReview}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {reviewBusy ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </>
        }
      >
        {reviewItem && (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-medium">Holat</span>
                <select
                  value={reviewStatus}
                  onChange={(e) => setReviewStatus(e.target.value as 'approved' | 'rejected')}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="approved">Tasdiqlash</option>
                  <option value="rejected">Rad etish</option>
                </select>
              </label>
              <label className="block space-y-1">
                <span className="text-xs font-medium">Tarif IDlari (vergul bilan)</span>
                <input
                  type="text"
                  value={reviewTariffs}
                  onChange={(e) => setReviewTariffs(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              <label className="block space-y-1 sm:col-span-2">
                <span className="text-xs font-medium">Maktab ichki IDlari (vergul bilan)</span>
                <textarea
                  rows={2}
                  value={reviewSchools}
                  onChange={(e) => setReviewSchools(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
            </div>

            <div className="space-y-3">
              {reviewItem.questions.map((q, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 p-4 text-sm space-y-1.5 dark:border-slate-800"
                >
                  <div className="font-semibold text-slate-900 dark:text-white">
                    {i + 1}. <SafeContent content={q.q} format={q.contentFormat} inline />
                  </div>
                  {q.options.map((opt, j) => (
                    <p
                      key={j}
                      className={`text-xs ${
                        q.answer === j ? 'font-semibold text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {q.answer === j ? "To'g'ri: " : ''}
                      {LETTERS[j]}. <SafeContent content={opt} format={q.contentFormat} inline />
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </AdminShell>
  );
}
