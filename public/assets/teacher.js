import {$, esc, api, toast, modal, confirmAction, download, percent, dateTime, empty, busy} from './common.js';

let token = '';
try { token = sessionStorage.getItem('nazorat-token') || ''; sessionStorage.removeItem('pw'); } catch {}
let page = 'dashboard', data = {classes:[], tests:[], results:[]}, resultPage = 1;
const filters = {search:'', testId:'', classId:'', sort:'time'};
const call = (path, options = {}) => api('admin/' + path, {token, ...options});
const post = (path, body = {}, method = 'POST') => call(path, {method, body:JSON.stringify(body)});
$('today').textContent = new Date().toLocaleDateString('uz-UZ', {timeZone:'Asia/Tashkent', year:'numeric',month:'long',day:'numeric'});
const heading = (title, subtitle, actions = '') => `<div class="admin-heading"><div><div class="eyebrow">O’QITUVCHI MAYDONI</div><h1>${title}</h1><p>${subtitle}</p></div><div class="row no-print">${actions}</div></div>`;
const action = (name, label, id = '', kind = '') => `<button class="btn ${kind}" data-action="${name}" data-id="${esc(id)}">${label}</button>`;
function logout() { token = ''; try { sessionStorage.removeItem('nazorat-token'); } catch {} $('panel').classList.add('hidden'); $('login').classList.remove('hidden'); $('pw').value = ''; }
$('logout').onclick = logout;
async function refresh() {
  const [classes, tests, results] = await Promise.all([call('classes'), call('tests'), call('results')]);
  data = {classes, tests, results}; render();
}
async function openPanel() { await refresh(); $('login').classList.add('hidden'); $('panel').classList.remove('hidden'); }
$('login-form').onsubmit = event => {
  event.preventDefault(); $('lerr').textContent = '';
  busy($('enter'), async () => { try { const login = await api('admin/login', {method:'POST', body:JSON.stringify({password:$('pw').value})}); token = login.token; try { sessionStorage.setItem('nazorat-token', token); } catch {} $('pw').value = ''; await openPanel(); } catch(error) { $('lerr').textContent = error.message; } });
};
document.querySelector('.nav').onclick = event => { const button = event.target.closest('[data-page]'); if (button) navigate(button.dataset.page); };
async function navigate(next) { page = next; document.querySelectorAll('[data-page]').forEach(b => { b.classList.toggle('active', b.dataset.page === page); if (b.dataset.page === page) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current'); }); render(); if (page === 'results' || page === 'dashboard') { try { await refresh(); } catch(error) { toast(error.message,true); if(error.status === 401) logout(); } } }
function render() {
  const views = {dashboard, classes:classesView, tests:testsView, results:resultsView, settings:settingsView};
  $('content').innerHTML = views[page]();
}
function rowsTable(rows, details = true) {
  return rows.length ? `<div class="table-wrap"><table><caption class="help">Natijalar · vaqt Toshkent bo’yicha</caption><thead><tr><th>O’quvchi</th><th>Sinf</th><th>Test</th><th>Ball</th><th>Foiz</th><th>Vaqt</th>${details ? '<th>Tafsilot</th>' : ''}</tr></thead><tbody>${rows.map(r => `<tr><td><b>${esc(r.surname)} ${esc(r.name)}</b></td><td>${esc(r.grade)}</td><td>${esc(r.testTitle || 'O’chirilgan test')}</td><td>${r.score}/${r.total}</td><td><span class="badge ${percent(r)>=60 ? 'success' : 'danger'}">${percent(r)}%</span></td><td class="help">${esc(dateTime(r.time))}</td>${details ? `<td>${action('result-detail','Ko’rish',r.id,'secondary small')}</td>` : ''}</tr>`).join('')}</tbody></table></div>` : empty('Hozircha natijalar yo’q', 'O’quvchilar testni yuborgach natijalar shu yerda ko’rinadi.');
}
function dashboard() {
  const date = new Date().toLocaleDateString('en-CA', {timeZone:'Asia/Tashkent'});
  const today = data.results.filter(r => new Date(r.time).toLocaleDateString('en-CA',{timeZone:'Asia/Tashkent'}) === date).length;
  const avg = data.results.length ? Math.round(data.results.reduce((s,r) => s+percent(r),0)/data.results.length) : 0;
  return heading('Bugungi manzara', 'O’quvchilaringiz yutuqlarini bir qarashda kuzating.', action('new-test','+ Yangi test') + action('new-class','+ Yangi sinf','','secondary')) +
    `<div class="stat-grid">${[[today,'Bugungi topshirishlar','↗'],[data.tests.filter(t => t.status === 'active').length,'Faol testlar','▤'],[data.classes.length,'Sinflar','♧'],[avg+'%','O’rtacha natija','▥']].map(([v,l,i]) => `<div class="card metric"><span class="badge">${i}</span><p>${l}</p><strong>${v}</strong></div>`).join('')}</div><div class="two-col"><section class="card"><div class="card-head"><h2>Oxirgi natijalar</h2>${action('show-results','Barchasini ko’rish →','','ghost small')}</div>${rowsTable(data.results.slice(0,10))}</section><section class="card"><div class="card-head"><h2>Sinflar bo’yicha natija</h2><span class="badge">%</span></div>${classChart()}<hr><h3>Kichik qadam, katta natija</h3><p>Testni sinfga biriktiring. O’quvchilar natijalarini tahlil qilib, keyingi darsni rejalashtiring.</p></section></div>`;
}
function classChart() {
  const groups = new Map(); for (const r of data.results) { const a = groups.get(r.grade) || []; a.push(percent(r)); groups.set(r.grade,a); }
  const entries = [...groups].sort(([a],[b]) => a.localeCompare(b)).slice(0,20);
  if (!entries.length) return empty('Diagramma uchun natijalar kerak');
  return `<svg class="bar-chart" role="img" aria-label="Sinflar o’rtacha foizlari" viewBox="0 0 420 ${entries.length*40+12}">${entries.map(([name,values],i) => { const avg = Math.round(values.reduce((a,b)=>a+b,0)/values.length); return `<text x="0" y="${i*40+25}">${esc(name)}</text><rect x="90" y="${i*40+8}" rx="5" width="${Math.max(2,avg*2.7)}" height="22"/><text x="${100+avg*2.7}" y="${i*40+25}">${avg}%</text>`; }).join('')}</svg>`;
}
function classesView() {
  return heading('Sinflar', 'Sinf ro’yxatlari va topshirish holatini boshqaring.', action('new-class','+ Yangi sinf')) + (data.classes.length ? `<div class="cards-grid">${data.classes.map(c => { const tests = data.tests.filter(t => t.classIds.includes(c.id)); const submitted = new Set(data.results.filter(r => r.classId === c.id || r.grade === c.name).map(r => (r.surname+' '+r.name).trim().toLowerCase())); const missing = c.students.filter(s => !submitted.has((s.surname+' '+s.name).trim().toLowerCase())); return `<article class="card stack"><div class="row between"><span class="avatar">${esc(c.name.slice(0,2))}</span><span class="badge neutral">${c.students.length} o’quvchi</span></div><div><h2>${esc(c.name)}</h2><p>${tests.length} ta biriktirilgan test</p></div><p class="help">${tests.map(t => esc(t.title)).join(', ') || 'Testlar hali biriktirilmagan.'}</p>${c.students.length ? `<p><b>${c.students.length-missing.length}</b> topshirgan · <b>${missing.length}</b> topshirmagan</p><details><summary>Topshirmaganlar (kamida bitta test bo’yicha)</summary><p class="help">${missing.map(s => esc(s.surname+' '+s.name)).join(', ') || 'Hamma topshirgan.'}</p></details>` : '<p class="help">O’quvchi ismini o’zi kiritadi.</p>'}<div class="row">${action('edit-class','Tahrirlash',c.id,'secondary')}${action('delete-class','O’chirish',c.id,'danger')}</div></article>`; }).join('')}</div>` : empty('Birinchi sinfni yarating', 'Masalan, 7-A yoki 8-B. O’quvchilar ro’yxatini keyin ham qo’shishingiz mumkin.'));
}
async function editClass(id) {
  const c = data.classes.find(c => c.id === id) || {name:'',students:[]};
  const dialog = await modal(id ? 'Sinfni tahrirlash' : 'Yangi sinf', `<form class="stack"><label>Sinf nomi<input id="class-name" required maxlength="60" value="${esc(c.name)}" placeholder="7-A"></label><label>O’quvchilar ro’yxati (ixtiyoriy)<textarea id="class-students" placeholder="Aliyev Ali&#10;Valiyeva Malika">${esc(c.students.map(s => s.surname+' '+s.name).join('\n'))}</textarea></label><p class="help">Har qatorda bitta Familiya Ism. Ro’yxatdan qatorni olib tashlash o’quvchini o’chiradi.</p></form>`, {confirm:'Saqlash'});
  if (!dialog) return;
  await post('classes' + (id ? '/'+id : ''), {name:dialog.querySelector('#class-name').value, roster:dialog.querySelector('#class-students').value}, id ? 'PUT' : 'POST');
  toast('Sinf saqlandi.'); await refresh();
}
function testsView() {
  return heading('Testlar', 'Savollarni tayyorlang, sinflarni biriktiring va vaqtni belgilang.', action('new-test','+ Yangi test')) + `<div class="toolbar"><input id="test-search" type="search" aria-label="Test qidirish" placeholder="Test nomi bo’yicha qidirish…"><select id="test-status" aria-label="Holat filtri"><option value="">Barcha holatlar</option><option value="active">Faol</option><option value="paused">To’xtatilgan</option><option value="scheduled">Jadvalda</option><option value="ended">Yakunlangan</option></select></div><div id="test-list">${testCards(data.tests)}</div>`;
}
function testCards(list) {
  const labels = {active:'Faol', paused:'To’xtatilgan', scheduled:'Jadvalda', ended:'Yakunlangan'};
  return list.length ? `<div class="cards-grid">${list.map(t => `<article class="card stack"><div class="row between"><span class="badge ${t.status === 'active' ? 'success' : 'neutral'}">● ${labels[t.status]}</span><span class="help">${t.count} savol</span></div><div><h2>${esc(t.title)}</h2><p>${t.classIds.map(id => esc(data.classes.find(c => c.id === id)?.name || 'Eski sinf')).join(', ')}</p></div><p class="help">${t.settings.timeLimitMin ? t.settings.timeLimitMin+' daqiqa' : 'Vaqt cheklanmagan'} · ${t.settings.maxAttempts} urinish${t.settings.shuffleQuestions ? ' · Aralashtiriladi' : ''}</p><div class="row">${action('edit-test','Tahrirlash',t.id,'secondary small')}${action('toggle-test',t.active ? 'To’xtatish' : 'Faollashtirish',t.id,'ghost small')}${action('duplicate-test','Nusxa',t.id,'ghost small')}${action('export-test','.txt eksport',t.id,'ghost small')}${action('delete-test','O’chirish',t.id,'danger small')}</div></article>`).join('')}</div>` : empty('Test topilmadi', 'Yangi test yuklang yoki qidiruvni o’zgartiring.');
}
function filterTests() { const q = $('test-search').value.toLowerCase(), status = $('test-status').value; $('test-list').innerHTML = testCards(data.tests.filter(t => t.title.toLowerCase().includes(q) && (!status || t.status === status))); }
async function editTest(id) {
  if (!data.classes.length) { toast('Avval sinf yarating.'); await editClass(); if (!data.classes.length) return; }
  const t = id ? await call('tests/'+id) : {title:'',classIds:[],questions:[],settings:{timeLimitMin:0,maxAttempts:1},schedule:{}};
  let questions = structuredClone(t.questions);
  const dateInput = v => v ? new Date(Date.parse(v) + 5*3600000).toISOString().slice(0,16) : '';
  const html = `<form id="test-editor" class="stack"><label>Test nomi<input id="edit-title" required maxlength="100" value="${esc(t.title)}" placeholder="1-Nazorat ishi"></label><fieldset><legend>Sinflar</legend><div class="row">${data.classes.map(c => `<label class="check"><input type="checkbox" name="classIds" value="${esc(c.id)}" ${t.classIds.includes(c.id) ? 'checked' : ''}>${esc(c.name)}</label>`).join('')}</div></fieldset><div class="fields"><label>Vaqt chegarasi (daqiqa, 0 — cheksiz)<input id="limit" type="number" min="0" max="240" value="${t.settings.timeLimitMin}" required></label><label>Urinishlar soni<input id="attempts" type="number" min="1" max="100" value="${t.settings.maxAttempts}" required></label><label>Boshlanish (Toshkent vaqti)<input id="schedule-start" type="datetime-local" value="${dateInput(t.schedule.start)}"></label><label>Tugash (Toshkent vaqti)<input id="schedule-end" type="datetime-local" value="${dateInput(t.schedule.end)}"></label></div><label class="check"><input id="shuffle-q" type="checkbox" ${t.settings.shuffleQuestions ? 'checked' : ''}>Savollarni aralashtirish</label><label class="check"><input id="shuffle-o" type="checkbox" ${t.settings.shuffleOptions ? 'checked' : ''}>Variantlarni aralashtirish</label><label class="check"><input id="show-answers" type="checkbox" ${t.settings.showAnswers ? 'checked' : ''}>Yakunlangach to’g’ri javoblarni ko’rsatish</label><hr><div class="file-drop stack"><label>Aiken .txt fayl<input id="import-file" type="file" accept=".txt,text/plain"></label><label>Yoki Aiken matni<textarea id="import-text" placeholder="Savol matni&#10;A. Birinchi variant&#10;B. Ikkinchi variant&#10;ANSWER: A"></textarea></label><button type="button" id="preview" class="btn secondary">Ko’rib chiqish va tahrirlagichga olish</button><a href="/namuna-test.txt" download>20 savollik namuna fayl</a><p id="preview-error" class="error" role="alert"></p></div><div class="row between"><h3>Savollarni tahrirlash</h3><button type="button" class="btn secondary" id="add-question">+ Savol</button></div><div id="editor-questions" class="stack"></div></form>`;
  const pending = modal(id ? 'Testni tahrirlash' : 'Yangi test', html, {confirm:'Testni saqlash'});
  const dialog = document.querySelector('dialog:last-of-type');
  function drawQuestions() { dialog.querySelector('#editor-questions').innerHTML = questions.length ? questions.map((q,i) => `<div class="question-editor stack" data-question="${i}"><div class="row between"><b>${i+1}-savol</b><button type="button" class="btn danger small" data-remove="${i}">O’chirish</button></div><label>Savol matni<textarea data-q="${i}" required maxlength="2000">${esc(q.q)}</textarea></label><p class="help">To’g’ri variant yonidagi doirani belgilang.</p>${q.options.map((o,j) => `<label class="option-edit"><input type="radio" name="correct-${i}" data-correct="${i}" value="${j}" ${q.answer === j ? 'checked' : ''} aria-label="${i+1}-savol ${'ABCDEF'[j]} to’g’ri javob"><span>${'ABCDEF'[j]}</span><input data-option="${i}" data-index="${j}" value="${esc(o)}" required maxlength="1000" aria-label="${i+1}-savol ${'ABCDEF'[j]} varianti"></label>`).join('')}<div class="row"><button type="button" class="btn ghost small" data-add-option="${i}" ${q.options.length>=6 ? 'disabled' : ''}>+ Variant</button><button type="button" class="btn ghost small" data-remove-option="${i}" ${q.options.length<=2 ? 'disabled' : ''}>Oxirgi variantni olish</button></div></div>`).join('') : empty('Hali savol yo’q', 'Fayl yuklang yoki qo’lda savol qo’shing.'); }
  drawQuestions();
  dialog.querySelector('#import-file').onchange = async event => { try { const file = event.target.files[0]; if (file.size > 1_000_000) throw new Error('Fayl 1 MB dan oshmasin.'); dialog.querySelector('#import-text').value = await file.text(); } catch(error) { toast(error.message,true); } };
  dialog.querySelector('#preview').onclick = event => busy(event.target, async () => { const err = dialog.querySelector('#preview-error'); err.textContent = ''; try { const result = await post('preview',{text:dialog.querySelector('#import-text').value}); questions = result.questions; drawQuestions(); toast(`${questions.length} savol tekshirildi. Pastda ko’rib chiqing.`); } catch(error) { err.textContent = error.message; } });
  dialog.querySelector('#add-question').onclick = () => { if (questions.length >= 200) return toast('200 savoldan oshmasin.',true); questions.push({q:'',options:['',''],answer:0}); drawQuestions(); };
  dialog.querySelector('#editor-questions').oninput = event => { const d = event.target.dataset; if (d.q !== undefined) questions[d.q].q = event.target.value; if (d.option !== undefined) questions[d.option].options[d.index] = event.target.value; if (d.correct !== undefined) questions[d.correct].answer = +event.target.value; };
  dialog.querySelector('#editor-questions').onclick = event => { const d = event.target.dataset; if (d.remove !== undefined) questions.splice(+d.remove,1); else if (d.addOption !== undefined) questions[d.addOption].options.push(''); else if (d.removeOption !== undefined) { const q = questions[d.removeOption]; q.options.pop(); if (q.answer >= q.options.length) q.answer = 0; } else return; drawQuestions(); };
  const accepted = await pending; if (!accepted) return;
  const value = id => accepted.querySelector('#'+id).value;
  const payload = {title:value('edit-title'),classIds:[...accepted.querySelectorAll('[name=classIds]:checked')].map(c=>c.value),questions,settings:{timeLimitMin:+value('limit'),maxAttempts:+value('attempts'),shuffleQuestions:accepted.querySelector('#shuffle-q').checked,shuffleOptions:accepted.querySelector('#shuffle-o').checked,showAnswers:accepted.querySelector('#show-answers').checked},schedule:{start:value('schedule-start') ? new Date(value('schedule-start')+'+05:00').toISOString() : null,end:value('schedule-end') ? new Date(value('schedule-end')+'+05:00').toISOString() : null}};
  try { await post('tests'+(id ? '/'+id : ''), payload, id ? 'PUT' : 'POST'); toast('Test saqlandi.'); await refresh(); }
  catch(error) { toast(error.message+' Tahrir saqlanmadi.',true); sessionStorage.setItem('nazorat-editor-recovery',JSON.stringify(payload)); }
}
function filteredResults() {
  return data.results.filter(r => (!filters.testId || r.testId===filters.testId) && (!filters.classId || r.classId===filters.classId) && `${r.surname} ${r.name}`.toLowerCase().includes(filters.search.toLowerCase())).sort((a,b) => filters.sort === 'score' ? percent(b)-percent(a) : filters.sort === 'name' ? (a.surname+a.name).localeCompare(b.surname+b.name,'uz') : b.time.localeCompare(a.time));
}
function resultsView() {
  return heading('Natijalar', 'O’sishni kuzating, savollarni tahlil qiling.', action('refresh','↻ Yangilash','','secondary')+action('analysis','Savollar tahlili','','secondary')) + `<div class="toolbar"><input id="result-search" type="search" placeholder="O’quvchini qidirish…" aria-label="O’quvchi qidirish" value="${esc(filters.search)}"><select id="result-test" aria-label="Test filtri"><option value="">Barcha testlar</option>${[...new Map([...data.tests.map(t => [t.id,t.title]),...data.results.map(r => [r.testId,r.testTitle])])].map(([id,title]) => `<option value="${esc(id)}" ${filters.testId === id ? 'selected' : ''}>${esc(title)}</option>`).join('')}</select><select id="result-class" aria-label="Sinf filtri"><option value="">Barcha sinflar</option>${data.classes.map(c => `<option value="${esc(c.id)}" ${filters.classId===c.id?'selected':''}>${esc(c.name)}</option>`).join('')}</select><select id="result-sort" aria-label="Saralash"><option value="time">Eng yangi</option><option value="score" ${filters.sort==='score'?'selected':''}>Yuqori ball</option><option value="name" ${filters.sort==='name'?'selected':''}>Familiya bo’yicha</option></select></div><div class="card"><div class="card-head"><h2>Topshirishlar ro’yxati</h2><div class="row no-print">${action('csv','CSV','','secondary small')}${action('excel','Excel (.xls)','','secondary small')}${action('print','Chop etish','','ghost small')}</div></div><div id="result-list">${resultList()}</div></div><div class="card"><h2>Sinflar taqqoslash</h2>${classChart()}</div>`;
}
function resultList() { const rows=filteredResults(), pages=Math.max(1,Math.ceil(rows.length/20)); resultPage=Math.min(resultPage,pages); return rowsTable(rows.slice((resultPage-1)*20,resultPage*20))+`<div class="row between no-print" style="margin-top:20px"><p class="help">${rows.length} natija · ${resultPage} / ${pages} sahifa</p><div class="row">${action('prev-page','← Oldingi','','secondary')}${action('next-page','Keyingi →','','secondary')}</div></div>`; }
async function resultDetail(id) {
  const r = await call('results/'+id);
  const html = `<p>${esc(r.surname+' '+r.name)} · ${esc(r.grade)} · ${r.score}/${r.total} (${percent(r)}%)</p><p>Sarflangan vaqt: ${r.durationSec === null ? 'Eski yozuvda saqlanmagan' : r.durationSec+' soniya'}</p>${r.questions?.length ? r.questions.map((q,i) => `<div class="answer-detail"><h3>${i+1}. ${esc(q.q)}</h3><p>Sizning javobingiz: ${esc(r.answers[i] === null ? 'Javobsiz' : q.options[r.answers[i]])}</p><p>To’g’ri javob: ${esc(q.options[q.answer])} ${r.answers[i]===q.answer?'✓':'×'}</p></div>`).join('') : empty('Batafsil javoblar saqlanmagan', 'Eski natija: ball va foiz to’liq ko’rsatilgan.')}<hr><div class="row">${action('allow-retake','Qayta topshirishga ruxsat',id,'secondary')}${action('delete-result','Natijani o’chirish',id,'danger')}</div>`;
  modal('Natija tafsiloti',html,{confirm:'',cancel:'Yopish'});
}
async function analysis() {
  const id = filters.testId || data.tests[0]?.id;
  if (!id) return toast('Tahlil uchun test tanlang.',true);
  const d = await call('analysis?testId='+encodeURIComponent(id));
  await modal('Savollar tahlili', `<p>${esc(d.title)} · ${d.attempts} ta batafsil natija</p><p class="help">Eski, javoblari saqlanmagan va boshqa tahrirdagi natijalar hisobga kiritilmaydi.</p><h3>Eng qiyin 5 savol</h3>${d.hardest.map(q => `<p>${q.index+1}. ${esc(q.q)} — ${q.percent}%</p>`).join('')}${d.questions.map(q => `<div class="answer-detail"><h3>${q.index+1}. ${esc(q.q)}</h3><p>To’g’ri javob: ${q.percent}% · ${q.count} javob</p><p class="help">${q.distribution.map((n,i) => `${'ABCDEF'[i]}: ${n}`).join(' · ')} · Javobsiz: ${q.unanswered}</p></div>`).join('')}`,{confirm:'',cancel:'Yopish'});
}
function settingsView() {
  return heading('Sozlamalar','Kirish va maktab ma’lumotlarini boshqaring.')+`<div class="two-col"><section class="card stack"><h2>Parolni o’zgartirish</h2><p>Yangi parol kamida 12 belgidan iborat bo’lsin. Saqlangach barcha eski sessiyalar tugaydi.</p><form id="password-form" class="stack"><label>Joriy parol<input id="old-password" type="password" autocomplete="current-password" required></label><label>Yangi parol<input id="new-password" type="password" autocomplete="new-password" minlength="12" maxlength="200" required></label><button class="btn">Yangi parolni saqlash</button></form></section><section class="card stack"><h2>Zaxira va tiklash</h2><p>Testlar, sinflar va natijalar bitta JSON faylda. Parol va token kaliti zaxiraga kiritilmaydi.</p>${action('backup','Zaxira nusxa yuklab olish','','secondary')}<label>Zaxiradan tiklash<input type="file" id="restore-file" accept=".json,application/json"></label><p class="help">Tiklash mavjud yozuvlarga ID bo’yicha qo’shiladi; bir xil ID yangilanadi.</p><hr><h3>Ma’lumotlarni tozalash</h3><p>Bu amal barcha sinflar, testlar, urinishlar va natijalarni o’chiradi. Avval zaxira oling.</p>${action('clear','Barcha ma’lumotlarni tozalash','','danger')}</section></div>`;
}
function exportRows(excel = false) {
  const rows = [['Familiya','Ism','Sinf','Test','Ball','Jami','Foiz','Vaqt'],...filteredResults().map(r => [r.surname,r.name,r.grade,r.testTitle,r.score,r.total,percent(r)+'%',dateTime(r.time)])];
  const safe = value => /^[=+@\-\t\r]/.test(String(value)) ? "'"+value : String(value ?? '');
  if (excel) download('natijalar.xls', '\ufeff<html><head><meta charset="UTF-8"></head><body><table>'+rows.map(row=>'<tr>'+row.map(c=>'<td>'+esc(safe(c))+'</td>').join('')+'</tr>').join('')+'</table></body></html>','application/vnd.ms-excel;charset=utf-8');
  else download('natijalar.csv','\ufeff'+rows.map(row=>row.map(c=>'"'+safe(c).replace(/"/g,'""')+'"').join(',')).join('\r\n'),'text/csv;charset=utf-8');
  toast('Eksport tayyor.');
}
const actions = {
  'new-class':()=>editClass(), 'edit-class':id=>editClass(id), 'new-test':()=>editTest(), 'edit-test':id=>editTest(id),
  'show-results':()=>navigate('results'), refresh:async()=>{await refresh();toast('Ma’lumotlar yangilandi.');},
  'delete-class':async id=>{ const related=data.tests.filter(t=>t.classIds.includes(id)).length; if(await confirmAction('Sinf o’chirilsinmi?', `${related} ta test shu sinfga biriktirilgan. Sinf testlardan olinadi, eski natijalar saqlanadi.`)){await call('classes/'+id,{method:'DELETE'});await refresh();toast('Sinf o’chirildi.');} },
  'delete-test':async id=>{if(await confirmAction('Test o’chirilsinmi?','Eski natijalar saqlanadi. Boshlangan urinishlar yuborilmaydi.')){await call('tests/'+id,{method:'DELETE'});await refresh();toast('Test o’chirildi.');}},
  'toggle-test':async id=>{await post('tests/'+id+'/toggle');await refresh();toast('Test holati yangilandi.');},
  'duplicate-test':async id=>{await post('tests/'+id+'/duplicate');await refresh();toast('Test nusxasi yaratildi.');},
  'export-test':async id=>{const t=await call('tests/'+id);download('test-'+id+'.txt',t.questions.map(q=>q.q+'\n'+q.options.map((o,i)=>'ABCDEF'[i]+'. '+o).join('\n')+'\nANSWER: '+'ABCDEF'[q.answer]).join('\n\n'));toast('Aiken fayli tayyor.');},
  'result-detail':resultDetail, analysis,
  'delete-result':async id=>{if(await confirmAction('Natija o’chirilsinmi?','Ball va javoblar o’chirilib, bu topshirish qayta ko’rinmaydi.')){await call('results/'+id,{method:'DELETE'});document.querySelector('dialog[open]')?.close();await refresh();toast('Natija o’chirildi.');}},
  'allow-retake':async id=>{await post('results/'+id+'/retake');toast('Yana bir urinishga ruxsat berildi.');},
  'prev-page':()=>{resultPage=Math.max(1,resultPage-1);$('result-list').innerHTML=resultList();},
  'next-page':()=>{resultPage++;$('result-list').innerHTML=resultList();},
  csv:()=>exportRows(),excel:()=>exportRows(true), print:()=>window.print(),
  backup:async()=>{const backup=await call('backup');download('nazorat-zaxira-'+new Date().toISOString().slice(0,10)+'.json',JSON.stringify(backup,null,2),'application/json');toast('Zaxira tayyor.');},
  clear:async()=>{if(await confirmAction('Barcha ma’lumotlar o’chirilsinmi?','Sinf, test, urinish va natijalar qaytarib bo’lmaydigan tarzda o’chiriladi. Zaxira olinganiga ishonch hosil qiling.')){await post('clear',{confirmation:'HAMMASINI OCHIRISH'});await refresh();toast('Ma’lumotlar tozalandi.');}}
};
document.addEventListener('click',event=>{const button=event.target.closest('[data-action]');if(button && actions[button.dataset.action]) busy(button,()=>actions[button.dataset.action](button.dataset.id));});
$('content').addEventListener('input',event=>{if(event.target.id==='test-search')filterTests();if(event.target.id==='result-search'){filters.search=event.target.value;resultPage=1;$('result-list').innerHTML=resultList();}});
$('content').addEventListener('change',async event=>{
  const id=event.target.id;
  if(id==='test-status')filterTests();
  if(['result-test','result-class','result-sort'].includes(id)){filters[{'result-test':'testId','result-class':'classId','result-sort':'sort'}[id]]=event.target.value;resultPage=1;$('result-list').innerHTML=resultList();}
  if(id==='restore-file')try{const file=event.target.files[0];if(!file)return;if(file.size>4_000_000)throw new Error('Zaxira 4 MB dan oshmasin.');const backup=JSON.parse(await file.text());if(await confirmAction('Zaxira tiklansinmi?','Bir xil ID dagi yozuvlar yangilanadi. Avval joriy zaxirani yuklab oling.')){await post('restore',backup);await refresh();toast('Zaxira tiklandi.');}}catch(error){toast(error.message,true);}
});
$('content').addEventListener('submit',event=>{if(event.target.id!=='password-form')return;event.preventDefault();busy(event.target.querySelector('button'),async()=>{await post('password',{currentPassword:$('old-password').value,newPassword:$('new-password').value});toast('Parol yangilandi. Qayta kiring.');logout();});});
if(token)openPanel().catch(error=>{logout();$('lerr').textContent=error.message;});
setInterval(()=>{if(token && page==='results' && !document.querySelector('dialog[open]'))refresh().catch(()=>{});},30000);
