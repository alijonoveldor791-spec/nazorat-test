import { getStore } from "@netlify/blobs";

const PASSWORD = () => Netlify.env.get("TEACHER_PASSWORD") || "oqituvchi123";
const json = (d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "Content-Type": "application/json" } });
const norm = (s) => String(s).trim().toLowerCase();

// Aiken formati: savol, A. B. C. D. variantlar, ANSWER: X — bloklar bo‘sh qator bilan ajratiladi
function parseAiken(text) {
  const blocks = text.replace(/\r/g, "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (!blocks.length) throw new Error("Fayl bo‘sh");
  if (blocks.length > 200) throw new Error("Savollar soni 200 tadan oshmasin");
  return blocks.map((blk, bi) => {
    const n = bi + 1, q = [], opts = [];
    let ans = null;
    for (const l of blk.split("\n").map((x) => x.trim()).filter(Boolean)) {
      const am = /^(?:ANSWER|JAVOB)\s*[:：]\s*([A-Fa-f])\s*$/i.exec(l);
      if (ans !== null) throw new Error(`${n}-savol: ANSWER faqat bir marta, oxirgi qatorda bo‘lishi kerak`);
      if (am) {
        if (opts.length < 2) throw new Error(`${n}-savol: ANSWER variantlardan keyin bo‘lishi kerak`);
        ans = am[1].toUpperCase().charCodeAt(0) - 65;
        continue;
      }
      const om = /^([A-Fa-f])[.)]\s*(.+)$/.exec(l);
      if (om && om[1].toUpperCase().charCodeAt(0) - 65 === opts.length) { opts.push(om[2].trim()); continue; }
      if (om) throw new Error(`${n}-savol: variantlar A dan boshlab ketma-ket bo‘lishi kerak`);
      if (!opts.length) q.push(l);
      else throw new Error(`${n}-savol: tushunarsiz qator: ${l}`);
    }
    if (!q.length) throw new Error(`${n}-savol: savol matni yo‘q`);
    if (opts.length < 2) throw new Error(`${n}-savol: kamida 2 ta variant kerak`);
    if (ans === null) throw new Error(`${n}-savol: ANSWER: qatori yo‘q`);
    if (ans >= opts.length) throw new Error(`${n}-savol: ANSWER variantlar orasida yo‘q`);
    return { q: q.join(" "), options: opts, answer: ans };
  });
}

export default async (req) => {
  const url = new URL(req.url), m = req.method;
  const [a, b, c] = url.pathname.replace(/^\/api\/?/, "").split("/").filter(Boolean);
  const tests = getStore({ name: "tests", consistency: "strong" }), results = getStore({ name: "results", consistency: "strong" });
  const all = async (st) => {
    const items = [];
    for await (const { blobs } of st.list({ paginate: true })) {
      items.push(...await Promise.all(blobs.map((x) => st.get(x.key, { type: "json" }))));
    }
    return items.filter(Boolean);
  };

  // ---------- O‘quvchi uchun ochiq yo‘llar ----------
  if (a === "grades" && m === "GET") {
    const map = new Map();
    (await all(tests)).filter((t) => t.active).forEach((t) => t.grades.forEach((g) => map.set(norm(g), g)));
    return json([...map.values()].sort((x, y) => x.localeCompare(y, "uz", { numeric: true })));
  }
  if (a === "tests" && m === "GET") {
    const g = norm(url.searchParams.get("grade") || "");
    const list = (await all(tests)).filter((t) => t.active && t.grades.some((x) => norm(x) === g));
    return json(list.map((t) => ({ id: t.id, title: t.title, count: t.questions.length })));
  }
  if (a === "test" && b && m === "GET") {
    const t = await tests.get(b, { type: "json" });
    if (!t || !t.active) return json({ error: "Test topilmadi" }, 404);
    return json({ id: t.id, title: t.title, questions: t.questions.map((q) => ({ q: q.q, options: q.options })) });
  }
  if (a === "submit" && m === "POST") {
    const d = await req.json();
    const t = await tests.get(String(d.testId || ""), { type: "json" });
    if (!t || !t.active) return json({ error: "Test topilmadi" }, 404);
    const name = String(d.name || "").trim().slice(0, 60), surname = String(d.surname || "").trim().slice(0, 60);
    const grade = t.grades.find((x) => norm(x) === norm(d.grade || ""));
    if (!name || !surname || !grade || !Array.isArray(d.answers)) return json({ error: "Maʼlumot to‘liq emas" }, 400);
    if (d.answers.length !== t.questions.length || d.answers.some((a, i) => a !== null && (!Number.isInteger(a) || a < 0 || a >= t.questions[i].options.length))) return json({ error: "Javoblar formati noto‘g‘ri" }, 400);
    const okList = t.questions.map((q, i) => d.answers[i] === q.answer);
    const score = okList.filter(Boolean).length;
    await results.setJSON(`${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, {
      testId: t.id, testTitle: t.title, name, surname, grade, score, total: t.questions.length, time: new Date().toISOString(),
    });
    return json({ score, total: t.questions.length, results: okList, title: t.title });
  }

  // ---------- O‘qituvchi yo‘llari (parol kerak) ----------
  if (a !== "admin") return json({ error: "Topilmadi" }, 404);
  if (req.headers.get("x-password") !== PASSWORD()) return json({ error: "Parol noto‘g‘ri" }, 401);

  if (b === "tests" && !c && m === "GET") {
    const l = await all(tests);
    l.sort((x, y) => y.created.localeCompare(x.created));
    return json(l.map((t) => ({ id: t.id, title: t.title, grades: t.grades, count: t.questions.length, active: t.active, created: t.created })));
  }
  if (b === "tests" && !c && m === "POST") {
    const d = await req.json();
    const title = String(d.title || "").trim().slice(0, 100);
    const grades = [...new Set(String(d.grades || "").split(/[,;\n]/).map((x) => x.trim()).filter(Boolean))].slice(0, 40);
    if (!title) return json({ error: "Test nomini kiriting" }, 400);
    if (!grades.length) return json({ error: "Kamida bitta sinf kiriting" }, 400);
    let questions;
    try { questions = parseAiken(String(d.text || "")); } catch (e) { return json({ error: e.message }, 400); }
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
    await tests.setJSON(id, { id, title, grades, questions, active: true, created: new Date().toISOString() });
    return json({ id, count: questions.length });
  }
  if (b === "tests" && c && m === "DELETE") { await tests.delete(c); return json({ ok: true }); }
  if (b === "tests" && c && m === "POST") {
    const t = await tests.get(c, { type: "json" });
    if (!t) return json({ error: "Topilmadi" }, 404);
    t.active = !t.active;
    await tests.setJSON(c, t);
    return json({ active: t.active });
  }
  if (b === "results" && m === "GET") {
    const l = await all(results);
    l.sort((x, y) => y.time.localeCompare(x.time));
    return json(l);
  }
  if (b === "clear" && m === "POST") {
    const keys = [];
    for await (const { blobs } of results.list({ paginate: true })) keys.push(...blobs.map((x) => x.key));
    await Promise.all(keys.map((key) => results.delete(key)));
    return json({ ok: true });
  }
  return json({ error: "Topilmadi" }, 404);
};

export const config = { path: "/api/*" };
