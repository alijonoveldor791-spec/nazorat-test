// Maktab mavzulari, tanlanganlar, qoralamalar va tarifli umumiy tayyor testlar sahifasi.
import { bootstrapPage } from './shell.js';
import { esc } from '../core/dom.js';
import { call, post } from './teacher-api.js';
import { newTopic, importTopic, inspectTopic } from './library-topics.js';
import { topicPrompt } from './library-prompt.js';
import { composeTopics, bindQuarterTotal } from './library-compose.js';
import { publishTest, downloadTest } from './library-actions.js';
import { toast } from '../components/toast.js';
let topics = [],
  selected = new Set(),
  tests = [],
  shared = [],
  access = { permissions: {} };
const button = (action, id, text, disabled = false) =>
  `<button class="btn secondary small" data-library="${action}" data-id="${esc(id)}" ${disabled ? 'disabled' : ''}>${text}</button>`;
const frame = () => `<h1>Savollar bazasi</h1><p>Sinf, fan, chorak va mavzu bo'yicha maktab savollari.</p>
  <div class="row"><button class="btn" data-library="new">+ Mavzu</button><button class="btn secondary" data-library="reload">Yangilash</button></div>
  <div class="row"><label>Sinf<input id="filter-grade" placeholder="7"></label><label>Fan<input id="filter-subject"></label>
  <label>Chorak<select id="filter-quarter"><option value="">Barchasi</option>${[1, 2, 3, 4].map((v) => `<option>${v}</option>`).join('')}</select></label>
  <label>Mavzu qidirish<input id="filter-query" type="search"></label></div>
  <div id="library-topics" class="stack"></div><h2>Tanlangan mavzular</h2><div id="library-selected"></div>
  <button class="btn" data-library="compose" id="compose-topics">Tanlangan mavzulardan test tuzish</button>
  <h2>Saqlangan testlar</h2><p class="help">PDF nusxasi ochilgach, chop oynasida PDF sifatida saqlang.</p><div id="library-tests" class="stack"></div>
  <h2>Umumiy testlar</h2><label>Test qidirish<input id="bank-query" type="search"></label><div id="library-bank" class="stack"></div>
  <input id="library-file" type="file" accept=".doc,.docx" hidden>`;
function draw() {
  const grade = document.getElementById('filter-grade').value.toLowerCase().trim();
  const subject = document.getElementById('filter-subject').value.toLowerCase().trim();
  const quarter = document.getElementById('filter-quarter').value;
  const query = document.getElementById('filter-query').value.toLowerCase().trim();
  document.getElementById('library-topics').innerHTML =
    topics
      .filter(
        (t) =>
          (!grade || t.grade.toLowerCase() === grade) &&
          (!subject || t.subject.toLowerCase().includes(subject)) &&
          (!quarter || t.quarter === +quarter) &&
          t.name.toLowerCase().includes(query)
      )
      .map(
        (t) =>
          `<article class="card"><h3>${esc(t.name)}</h3><p>${esc(t.grade)}-sinf / ${esc(t.subject)} / ${t.quarter}-chorak / ${t.count} savol</p><div class="row">
    ${button('select', t.id, '+', selected.has(t.id) || !t.count)}${button('inspect', t.id, 'Savollar')}
    ${button('upload', t.id, "Word qo'shish")}${button('prompt', t.id, 'Prompt tayyorlash')}</div></article>`
      )
      .join('') || '<p>Mavzu topilmadi.</p>';
  document.getElementById('library-selected').innerHTML =
    topics
      .filter((t) => selected.has(t.id))
      .map((t) => `<p>${esc(t.name)} ${button('unselect', t.id, 'Olib tashlash')}</p>`)
      .join('') || '<p>+ orqali mavzu tanlang.</p>';
  document.getElementById('compose-topics').disabled = !selected.size;
  document.getElementById('library-tests').innerHTML =
    tests
      .map((t) => {
        const own = t.origin?.type !== 'shared',
          p = access.permissions;
        return `<article class="card"><h3>${esc(t.title)}</h3><p>${t.count} savol / ${own ? 'Maktab testi' : 'Umumiy bank nusxasi'} / ${t.active ? 'Faol' : 'Qoralama'}</p>${t.composition ? `<p>${t.composition.topics.map((topic) => `${esc(topic.name)}: ${topic.count}`).join(' + ')}</p>` : ''}<div class="row">
      ${button('publish', t.id, 'Onlayn berish', !own && !(p.take || p.rerunExpired))}
      ${button('docx', t.id, 'Word yuklab olish', !own && !p.docx)}${button('pdf', t.id, 'PDF yuklab olish', !own && !p.pdf)}
      ${button('key', t.id, 'Javoblar kaliti', !own && !p.key)}${own ? button('share', t.id, 'Ulashishga yuborish') : ''}</div></article>`;
      })
      .join('') || "<p>Saqlangan test yo'q.</p>";
  const bankQuery = document.getElementById('bank-query').value.toLowerCase();
  document.getElementById('library-bank').innerHTML = !access.permissions.view
    ? '<p>Tarifda umumiy bank yopiq.</p>'
    : shared
        .filter((t) => (t.title + ' ' + t.subject).toLowerCase().includes(bankQuery))
        .map(
          (
            t
          ) => `<article class="card"><h3>${esc(t.title)}</h3><p>${esc(t.subject)} / ${t.count} savol</p><div class="row">
    ${button('take', t.id, 'Testni olish', !access.permissions.take)}${button('bank-docx', t.id, 'Word yuklab olish', !access.permissions.docx)}
    ${button('bank-pdf', t.id, 'PDF yuklab olish', !access.permissions.pdf)}${button('bank-key', t.id, 'Javoblar kaliti', !access.permissions.key)}</div></article>`
        )
        .join('');
}
async function reload() {
  [topics, tests, access] = await Promise.all([call('topics'), call('tests'), call('bank-access')]);
  shared = access.permissions.view ? await call('shared-tests') : [];
  draw();
}
bindQuarterTotal();
if (await bootstrapPage('library', frame)) {
  document.querySelectorAll('[id^="filter-"], #bank-query').forEach((n) => n.addEventListener('input', draw));
  document.addEventListener('click', async (event) => {
    const b = event.target.closest('[data-library]');
    if (!b || b.disabled) return;
    b.disabled = true;
    const id = b.dataset.id,
      action = b.dataset.library;
    try {
      if (action === 'select') {
        const first = topics.find((t) => selected.has(t.id)),
          next = topics.find((t) => t.id === id);
        if (first && ['grade', 'subject', 'quarter'].some((k) => first[k] !== next[k]))
          throw new Error('Bir sinf, fan va chorak mavzularini tanlang.');
        selected.add(id);
        draw();
      } else if (action === 'unselect') {
        selected.delete(id);
        draw();
      } else if (action === 'new') {
        await newTopic();
        await reload();
      } else if (action === 'reload') await reload();
      else if (action === 'prompt') await topicPrompt(topics.find((t) => t.id === id));
      else if (action === 'inspect') {
        await inspectTopic(id);
        await reload();
      } else if (action === 'upload') {
        const file = document.getElementById('library-file');
        file.dataset.topic = id;
        file.click();
      } else if (action === 'compose') {
        await composeTopics(topics.filter((t) => selected.has(t.id)));
        await reload();
      } else if (action === 'publish') {
        await publishTest(id);
        await reload();
      } else if (action === 'share') {
        await post(`tests/${id}/share`);
        toast("Ko'rib chiqishga yuborildi.");
      } else if (action === 'take') {
        await post(`shared-tests/${id}/take`);
        await reload();
      } else if (action.startsWith('bank-')) await downloadTest(id, action.slice(5), true);
      else await downloadTest(id, action);
    } catch (error) {
      toast(error.message, true);
    } finally {
      b.disabled = false;
    }
  });
  document.getElementById('library-file').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      await importTopic(event.target.dataset.topic, file);
      await reload();
    } catch (error) {
      toast(error.message, true);
    } finally {
      event.target.value = '';
    }
  });
  try {
    await reload();
  } catch (error) {
    toast(error.message, true);
  }
}
